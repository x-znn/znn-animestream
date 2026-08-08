import { AnimeCard } from '@/components/AnimeCard';
import { Pager } from '@/components/Pager';
import { getCompleted } from '@/lib/otakudesu';

export const metadata = { title: 'Anime Completed' };

export default async function CompletedPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || 1) || 1);
  const data = await getCompleted(page);
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#a894ff]">Tamat</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Anime Completed</h1>
        <p className="mt-2 text-sm text-white/45">Pilih anime yang sudah selesai tayang dan tonton dari episode awal.</p>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {data.items.map((anime) => <AnimeCard key={anime.slug} anime={anime} />)}
      </div>
      <Pager page={data.page} hasNext={data.hasNext} basePath="/completed" />
    </div>
  );
}
