'use client';

import { Heart } from 'lucide-react';
import { AnimeCard } from '@/components/AnimeCard';
import { useFavorites } from '@/hooks/use-favorites';

export default function FavoritesPage() {
  const { favorites, isLoaded } = useFavorites();
  if (!isLoaded) return <div className="py-20 text-center text-sm text-white/35">Memuat favorit...</div>;
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#a894ff]">Koleksi kamu</p>
        <h1 className="mt-2 text-3xl font-black text-white">Anime Favorit</h1>
      </div>
      {favorites.length ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {favorites.map((item) => (
            <AnimeCard key={item.slug} anime={{ title: item.title, thumb: item.poster, slug: item.slug, status: null, episode: null, rating: null, updatedOn: null, genres: [] }} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[.025] py-20 text-center">
          <Heart className="mx-auto h-10 w-10 text-white/15" />
          <h2 className="mt-4 text-lg font-bold text-white/70">Belum ada favorit</h2>
          <p className="mt-1 text-sm text-white/35">Simpan anime dari halaman detail.</p>
        </div>
      )}
    </div>
  );
}
