import { NextRequest, NextResponse } from 'next/server';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ProbeKind = 'iframe' | 'video' | 'hls' | 'external';

type ProbeResult = {
  ok: boolean;
  kind: ProbeKind;
  url: string;
  reason?: string;
  contentType?: string | null;
  status?: number;
};

function privateIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return true;
  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

function privateIpv6(ip: string): boolean {
  const value = ip.toLowerCase();
  return value === '::1' || value === '::' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe8') || value.startsWith('fe9') || value.startsWith('fea') || value.startsWith('feb');
}

async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Protocol tidak didukung.');
  if (url.username || url.password) throw new Error('URL tidak valid.');

  const hostname = url.hostname.toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new Error('Host tidak diizinkan.');
  }

  const literal = isIP(hostname);
  if (literal === 4 && privateIpv4(hostname)) throw new Error('Host private tidak diizinkan.');
  if (literal === 6 && privateIpv6(hostname)) throw new Error('Host private tidak diizinkan.');

  if (!literal) {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (!addresses.length) throw new Error('Host tidak ditemukan.');
    for (const item of addresses) {
      if ((item.family === 4 && privateIpv4(item.address)) || (item.family === 6 && privateIpv6(item.address))) {
        throw new Error('Host private tidak diizinkan.');
      }
    }
  }

  return url;
}

function frameBlocked(headers: Headers, parentOrigin: string): string | null {
  const xfo = (headers.get('x-frame-options') || '').toLowerCase();
  if (xfo.includes('deny')) return 'Server menolak iframe (X-Frame-Options: DENY).';
  if (xfo.includes('sameorigin')) return 'Server hanya mengizinkan iframe dari domain yang sama.';

  const csp = (headers.get('content-security-policy') || '').toLowerCase();
  const match = csp.match(/frame-ancestors\s+([^;]+)/i);
  if (match) {
    const rule = match[1].trim();
    const tokens = rule.split(/\s+/).filter(Boolean);
    if (tokens.includes("'none'")) return 'Server menolak iframe melalui Content-Security-Policy.';

    const parent = parentOrigin.toLowerCase();
    const allowsAnyHttps = tokens.includes('https:') && parent.startsWith('https://');
    const allowsAnyHttp = tokens.includes('http:') && parent.startsWith('http://');
    const allowsExactParent = tokens.some((token) => token.replace(/\/$/, '') === parent.replace(/\/$/, ''));
    const allowsWildcard = tokens.includes('*');

    if (!allowsAnyHttps && !allowsAnyHttp && !allowsExactParent && !allowsWildcard) {
      return 'Server membatasi domain yang boleh memasang iframe.';
    }
  }

  return null;
}

function classify(url: URL, headers: Headers, parentOrigin: string): { kind: ProbeKind; reason?: string } {
  const contentType = (headers.get('content-type') || '').toLowerCase();
  const pathname = url.pathname.toLowerCase();

  if (pathname.endsWith('.m3u8') || contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('application/x-mpegurl')) {
    return { kind: 'hls' };
  }

  if (/\.(mp4|webm|ogg|m4v)(?:$|\?)/i.test(`${url.pathname}${url.search}`) || contentType.startsWith('video/')) {
    return { kind: 'video' };
  }

  const blocked = frameBlocked(headers, parentOrigin);
  if (blocked) return { kind: 'external', reason: blocked };

  return { kind: 'iframe' };
}

async function requestHeaders(initial: URL): Promise<{ response: Response; finalUrl: URL }> {
  let current = initial;

  for (let redirect = 0; redirect < 5; redirect += 1) {
    current = await assertPublicUrl(current.toString());

    let response = await fetch(current, {
      method: 'HEAD',
      redirect: 'manual',
      cache: 'no-store',
      headers: {
        accept: '*/*',
        'user-agent': 'Mozilla/5.0 ZNN-Animestream/1.0',
      },
      signal: AbortSignal.timeout(7000),
    });

    if ([403, 405].includes(response.status)) {
      response = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        cache: 'no-store',
        headers: {
          accept: '*/*',
          range: 'bytes=0-1',
          'user-agent': 'Mozilla/5.0 ZNN-Animestream/1.0',
        },
        signal: AbortSignal.timeout(7000),
      });
      void response.body?.cancel();
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) return { response, finalUrl: current };
      current = new URL(location, current);
      continue;
    }

    return { response, finalUrl: current };
  }

  throw new Error('Terlalu banyak redirect.');
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url')?.trim() || '';
  if (!raw) {
    return NextResponse.json<ProbeResult>({ ok: false, kind: 'external', url: '', reason: 'URL stream kosong.' }, { status: 400 });
  }

  try {
    const initial = await assertPublicUrl(raw);
    const { response, finalUrl } = await requestHeaders(initial);
    const classified = classify(finalUrl, response.headers, request.nextUrl.origin);
    const info = response.status >= 400 && !['video', 'hls'].includes(classified.kind)
      ? { kind: 'external' as const, reason: `Server membalas HTTP ${response.status}.` }
      : classified;
    const contentType = response.headers.get('content-type');

    return NextResponse.json<ProbeResult>({
      ok: response.ok || response.status === 206,
      kind: info.kind,
      url: finalUrl.toString(),
      reason: info.reason,
      contentType,
      status: response.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server tidak dapat diperiksa.';
    return NextResponse.json<ProbeResult>({ ok: false, kind: 'external', url: raw, reason: message }, { status: 200 });
  }
}
