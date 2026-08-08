'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';

export function FavoriteButton({ anime }: { anime: { slug: string; title: string; poster: string | null } }) {
  const { toggleFavorite, isFavorite, isLoaded } = useFavorites();
  const active = isLoaded && isFavorite(anime.slug);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(anime)}
      className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${active ? 'border-[#7057ff]/60 bg-[#7057ff]/15 text-[#b9aaff]' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
    >
      <Heart className={`h-4 w-4 ${active ? 'fill-current' : ''}`} /> {active ? 'Tersimpan' : 'Favorit'}
    </button>
  );
}
