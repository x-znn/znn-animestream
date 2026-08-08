'use client';

import Hls from 'hls.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ExternalLink, LoaderCircle, MonitorPlay, RotateCcw, Server, Tv } from 'lucide-react';
import type { StreamDownloadLink } from '@/lib/otakudesu';

type Props = {
  title: string;
  streamLink: string | null;
  downloadLinks: Record<string, StreamDownloadLink[]>;
};

type Source = {
  id: string;
  label: string;
  url: string;
  quality: string | null;
  primary: boolean;
};

type Probe = {
  ok: boolean;
  kind: 'iframe' | 'video' | 'hls' | 'external';
  url: string;
  reason?: string;
  contentType?: string | null;
  status?: number;
};

function qualityScore(value: string): number {
  const match = value.match(/(\d{3,4})p/i);
  if (!match) return 0;
  const n = Number(match[1]);
  if (n === 720) return 5000;
  if (n === 480) return 4000;
  if (n === 360) return 3000;
  if (n === 1080) return 2000;
  return n;
}

function sourceId(quality: string, provider: string, index: number): string {
  return `${quality}:${provider}:${index}`;
}

function DirectVideo({ src, hls, title }: { src: string; hls: boolean; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!hls || !videoRef.current) return;
    const video = videoRef.current;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    if (!Hls.isSupported()) return;
    const player = new Hls({ enableWorker: true, lowLatencyMode: true });
    player.loadSource(src);
    player.attachMedia(video);
    return () => player.destroy();
  }, [hls, src]);

  return (
    <video
      ref={videoRef}
      src={hls ? undefined : src}
      title={title}
      controls
      playsInline
      preload="metadata"
      className="h-full w-full bg-black object-contain"
    />
  );
}

export function StreamPlayer({ title, streamLink, downloadLinks }: Props) {
  const qualities = useMemo(
    () => Object.keys(downloadLinks).sort((a, b) => qualityScore(b) - qualityScore(a)),
    [downloadLinks],
  );

  const firstQuality = qualities[0] || '';
  const [quality, setQuality] = useState(firstQuality);

  const sources = useMemo<Source[]>(() => {
    const list: Source[] = [];

    if (streamLink) {
      list.push({ id: 'main', label: 'Server Utama', url: streamLink, quality: null, primary: true });
    }

    (downloadLinks[quality] || []).forEach((item, index) => {
      list.push({
        id: sourceId(quality, item.provider, index),
        label: item.provider,
        url: item.url,
        quality,
        primary: false,
      });
    });

    return list;
  }, [downloadLinks, quality, streamLink]);

  const [selectedId, setSelectedId] = useState(streamLink ? 'main' : '');
  const selected = sources.find((source) => source.id === selectedId) || sources[0] || null;
  const [probeEntry, setProbeEntry] = useState<{ sourceId: string; result: Probe } | null>(null);
  const [autoMode, setAutoMode] = useState(true);
  const [attempted, setAttempted] = useState<string[]>([]);
  const [loadedIframeUrl, setLoadedIframeUrl] = useState('');

  useEffect(() => {
    if (!selected?.url) return;

    let cancelled = false;
    const controller = new AbortController();
    const sourceId = selected.id;
    const sourceUrl = selected.url;

    fetch(`/api/stream-probe?url=${encodeURIComponent(sourceUrl)}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((response) => response.json() as Promise<Probe>)
      .then((result) => {
        if (cancelled) return;
        setProbeEntry({ sourceId, result });

        if (autoMode && result.kind === 'external') {
          setAttempted((current) => current.includes(sourceId) ? current : [...current, sourceId]);
          const index = sources.findIndex((source) => source.id === sourceId);
          const nextSource = index >= 0 ? sources[index + 1] : null;
          if (nextSource) {
            window.setTimeout(() => {
              if (!cancelled) setSelectedId(nextSource.id);
            }, 550);
          } else {
            setAutoMode(false);
          }
        } else if (result.kind !== 'external') {
          setAutoMode(false);
        }
      })
      .catch((error: unknown) => {
        if (cancelled || (error instanceof DOMException && error.name === 'AbortError')) return;
        setProbeEntry({ sourceId, result: { ok: false, kind: 'external', url: sourceUrl, reason: 'Pemeriksaan server gagal.' } });
        setAutoMode(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [autoMode, selected?.id, selected?.url, sources]);

  function chooseSource(id: string) {
    setAutoMode(false);
    setAttempted([]);
    setSelectedId(id);
  }

  function changeQuality(nextQuality: string) {
    setQuality(nextQuality);
    setAutoMode(true);
    setAttempted([]);
    const first = downloadLinks[nextQuality]?.[0];
    setSelectedId(first ? sourceId(nextQuality, first.provider, 0) : (streamLink ? 'main' : ''));
  }

  function retryAuto() {
    setAttempted([]);
    setAutoMode(true);
    setSelectedId(streamLink ? 'main' : (sources[0]?.id || ''));
  }

  const probe = probeEntry?.sourceId === selected?.id ? probeEntry.result : null;
  const loading = Boolean(selected?.url && !probe);
  const playableUrl = probe?.url || selected?.url || '';
  const iframeReady = Boolean(playableUrl && loadedIframeUrl === playableUrl);
  const allTried = sources.length > 0 && attempted.length >= sources.length;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Server className="h-4 w-4 text-[#a894ff]" /> Pilih stream
            </div>
            <p className="mt-1 text-xs leading-5 text-white/40">Mode otomatis mencari server yang bisa diputar di halaman ini.</p>
          </div>

          {qualities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {qualities.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => changeQuality(item)}
                  className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
                    item === quality
                      ? 'border-[#7057ff] bg-[#7057ff]/20 text-[#c1b5ff]'
                      : 'border-white/10 bg-white/[.035] text-white/50 hover:bg-white/[.07] hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {sources.length > 0 ? (
            sources.map((source) => {
              const active = selected?.id === source.id;
              const blocked = attempted.includes(source.id) && !active;
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => chooseSource(source.id)}
                  className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-extrabold transition ${
                    active
                      ? 'border-[#806cff] bg-[#7057ff] text-white shadow-[0_8px_30px_rgba(112,87,255,.25)]'
                      : blocked
                        ? 'border-amber-400/15 bg-amber-400/[.04] text-amber-200/35'
                        : 'border-white/10 bg-white/[.035] text-white/55 hover:border-white/20 hover:bg-white/[.07] hover:text-white'
                  }`}
                >
                  <Tv className="h-3.5 w-3.5" />
                  {source.label}
                  {source.primary && <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] uppercase">utama</span>}
                  {blocked && <span className="text-[9px] uppercase">eksternal</span>}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-white/35">Belum ada server yang tersedia untuk episode ini.</p>
          )}
        </div>

        {(autoMode || allTried) && sources.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-white/35">
            {autoMode && !allTried ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#a894ff]" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-300/70" />}
            {autoMode && !allTried ? 'Mencari server yang bisa diputar…' : 'Server otomatis habis dicoba. Kamu masih bisa pilih server manual.'}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_30px_90px_rgba(0,0,0,.4)]">
        <div className="relative aspect-video w-full bg-black">
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#07080b] text-center">
              <LoaderCircle className="h-9 w-9 animate-spin text-[#8b73ff]" />
              <div>
                <p className="text-sm font-black text-white">Menyiapkan player…</p>
                <p className="mt-1 text-xs text-white/35">Mengecek server dan tipe stream</p>
              </div>
            </div>
          )}

          {!selected?.url ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white/45">
              <MonitorPlay className="h-10 w-10 text-white/20" />
              <p className="text-sm">Link stream tidak tersedia untuk episode ini.</p>
            </div>
          ) : probe?.kind === 'video' ? (
            <DirectVideo src={playableUrl} hls={false} title={title} />
          ) : probe?.kind === 'hls' ? (
            <DirectVideo src={playableUrl} hls title={title} />
          ) : probe?.kind === 'iframe' ? (
            <>
              {!iframeReady && !loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#07080b]">
                  <LoaderCircle className="h-8 w-8 animate-spin text-[#8b73ff]" />
                </div>
              )}
              <iframe
                key={playableUrl}
                src={playableUrl}
                title={`${title} - ${selected.label}`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="no-referrer"
                onLoad={() => setLoadedIframeUrl(playableUrl)}
                className="h-full w-full border-0"
              />
            </>
          ) : probe?.kind === 'external' ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/15 bg-amber-300/[.06]">
                <ExternalLink className="h-6 w-6 text-amber-200/65" />
              </div>
              <div className="max-w-md">
                <p className="text-base font-black text-white">Server ini hanya bisa dibuka langsung</p>
                <p className="mt-2 text-xs leading-5 text-white/40">{probe.reason || 'Server membatasi pemutaran di dalam iframe.'}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <a href={playableUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-black">
                  Buka server <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button type="button" onClick={retryAuto} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-white/70">
                  Coba otomatis <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {selected?.url && probe?.kind !== 'external' && (
        <div className="flex justify-end">
          <a href={playableUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-3.5 py-2 text-xs font-bold text-white/45 transition hover:bg-white/[.07] hover:text-white">
            Buka server langsung <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
