import { Search } from 'lucide-react';
import { AnimeCard } from '@/components/AnimeCard';
import { searchAnime } from '@/lib/otakudesu';

export const metadata = { title: 'Cari Anime' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = String(sp.q || '').trim();
  if (!q) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <Search className="mx-auto h-10 w-10 text-white/20" />
        <h1 className="mt-4 text-2xl font-black text-white">Cari anime</h1>
        <p className="mt-2 text-sm text-white/45">Ketik judul anime lewat kolom pencarian di atas.</p>
      </div>
    );
  }
  const data = await searchAnime(q);
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#a894ff]">Pencarian</p>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">Hasil untuk “{q}”</h1>
        <p className="mt-2 text-sm text-white/45">{data.items.length} hasil ditemukan.</p>
      </div>
      {data.items.length ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data.items.map((anime) => <AnimeCard key={`${anime.slug}-${anime.title}`} anime={anime} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[.025] py-20 text-center text-sm text-white/40">Anime tidak ditemukan.</div>
      )}
    </div>
  );
}
