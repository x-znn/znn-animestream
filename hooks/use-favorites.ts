'use client';

import { useMemo, useSyncExternalStore } from 'react';

export interface FavoriteItem {
  slug: string;
  title: string;
  poster: string | null;
}

const KEY = 'znnAnimeFavorites';
const CHANGE_EVENT = 'znn-anime-favorites-change';
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

function parseFavorites(raw: string): FavoriteItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as FavoriteItem[] : [];
  } catch {
    return [];
  }
}

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const favorites = useMemo(() => parseFavorites(raw), [raw]);
  const isLoaded = useHydrated();

  const toggleFavorite = (item: FavoriteItem) => {
    if (typeof window === 'undefined') return;

    const current = parseFavorites(getSnapshot());
    const exists = current.some((favorite) => favorite.slug === item.slug);
    const next = exists
      ? current.filter((favorite) => favorite.slug !== item.slug)
      : [item, ...current];

    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {}
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite: (slug: string) => favorites.some((favorite) => favorite.slug === slug),
    isLoaded,
  };
}
