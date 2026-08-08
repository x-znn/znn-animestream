'use client';

import { useEffect, useState } from 'react';

export interface FavoriteItem {
  slug: string;
  title: string;
  poster: string | null;
}

const KEY = 'znnAnimeFavorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try { setFavorites(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { setFavorites([]); }
    setIsLoaded(true);
  }, []);

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.slug === item.slug);
      const next = exists ? prev.filter((f) => f.slug !== item.slug) : [item, ...prev];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite: (slug: string) => favorites.some((f) => f.slug === slug),
    isLoaded,
  };
}
