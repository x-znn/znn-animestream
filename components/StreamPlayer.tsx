'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, MonitorPlay, Server, Tv } from 'lucide-react';
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
      list.push({
        id: 'main',
        label: 'Server Utama',
        url: streamLink,
        quality: null,
        primary: true,
      });
    }

    for (const item of downloadLinks[quality] || []) {
      list.push({
        id: `${quality}:${item.provider}:${item.url}`,
        label: item.provider,
        url: item.url,
        quality,
        primary: false,
      });
    }

    return list;
  }, [downloadLinks, quality, streamLink]);

  const [selectedId, setSelectedId] = useState(streamLink ? 'main' : '');
  const selected = sources.find((source) => source.id === selectedId) || sources[0] || null;

  function changeQuality(nextQuality: string) {
    setQuality(nextQuality);
    if (!streamLink) setSelectedId('');
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Server className="h-4 w-4 text-[#a894ff]" /> Pilih stream
            </div>
            <p className="mt-1 text-xs leading-5 text-white/40">Kalau server utama bermasalah, coba server cadangan.</p>
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
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedId(source.id)}
                  className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-extrabold transition ${
                    active
                      ? 'border-[#806cff] bg-[#7057ff] text-white shadow-[0_8px_30px_rgba(112,87,255,.25)]'
                      : 'border-white/10 bg-white/[.035] text-white/55 hover:border-white/20 hover:bg-white/[.07] hover:text-white'
                  }`}
                >
                  <Tv className="h-3.5 w-3.5" />
                  {source.label}
                  {source.primary && <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] uppercase">utama</span>}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-white/35">Belum ada server yang tersedia untuk episode ini.</p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_30px_90px_rgba(0,0,0,.4)]">
        <div className="aspect-video w-full bg-black">
          {selected?.url ? (
            <iframe
              key={selected.url}
              src={selected.url}
              title={`${title} - ${selected.label}`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer"
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white/45">
              <MonitorPlay className="h-10 w-10 text-white/20" />
              <p className="text-sm">Link stream tidak tersedia untuk episode ini.</p>
            </div>
          )}
        </div>
      </section>

      {selected?.url && (
        <div className="flex justify-end">
          <a
            href={selected.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-3.5 py-2 text-xs font-bold text-white/45 transition hover:bg-white/[.07] hover:text-white"
          >
            Buka server langsung <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
