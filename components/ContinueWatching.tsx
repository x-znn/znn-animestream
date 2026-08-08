'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

export type WatchHistoryItem = {
  animeSlug: string;
  animeTitle: string;
  poster: string | null;
  episodeSlug: string;
  episodeTitle: string;
  watchedAt: number;
};

const KEY = 'znnAnimeWatchHistory';

export function saveWatchHistory(item: WatchHistoryItem) {
  if (typeof window === 'undefined') return;
  try {
    const current = JSON.parse(localStorage.getItem(KEY) || '[]') as WatchHistoryItem[];
    const next = [item, ...current.filter((x) => x.episodeSlug !== item.episodeSlug)].slice(0, 12);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function ContinueWatching() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { setItems([]); }
  }, []);
  if (!items.length) return null;

  return (
    <section>
      <div className="mb-5 flex items-center gap-2">
        <Clock3 className="h-5 w-5 text-[#a894ff]" />
        <h2 className="text-xl font-black text-white sm:text-2xl">Lanjut nonton</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item) => (
          <Link key={item.episodeSlug} href={`/watch/${item.episodeSlug}?anime=${encodeURIComponent(item.animeSlug)}`} className="group flex gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-3 transition hover:border-[#7057ff]/40 hover:bg-white/[.055]">
            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
              {item.poster ? <Image src={item.poster} alt={item.animeTitle} fill className="object-cover" referrerPolicy="no-referrer" /> : null}
            </div>
            <div className="min-w-0 flex-1 py-1">
              <p className="line-clamp-2 text-sm font-bold text-white">{item.animeTitle}</p>
              <p className="mt-1 line-clamp-1 text-xs text-white/45">{item.episodeTitle}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#a894ff]"><Play className="h-3.5 w-3.5 fill-current" /> Lanjutkan</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
