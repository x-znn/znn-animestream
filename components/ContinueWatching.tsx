'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Play } from 'lucide-react';
import { useMemo, useSyncExternalStore } from 'react';

export type WatchHistoryItem = {
  animeSlug: string;
  animeTitle: string;
  poster: string | null;
  episodeSlug: string;
  episodeTitle: string;
  watchedAt: number;
};

const KEY = 'znnAnimeWatchHistory';
const CHANGE_EVENT = 'znn-anime-watch-history-change';
const EMPTY = '[]';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) callback();
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot() {
  if (typeof window === 'undefined') return EMPTY;
  return localStorage.getItem(KEY) || EMPTY;
}

function getServerSnapshot() {
  return EMPTY;
}

function parseHistory(raw: string): WatchHistoryItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as WatchHistoryItem[] : [];
  } catch {
    return [];
  }
}

export function saveWatchHistory(item: WatchHistoryItem) {
  if (typeof window === 'undefined') return;

  const current = parseHistory(getSnapshot());
  const next = [item, ...current.filter((x) => x.episodeSlug !== item.episodeSlug)].slice(0, 12);

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {}
}

export function ContinueWatching() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = useMemo(() => parseHistory(raw), [raw]);

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
