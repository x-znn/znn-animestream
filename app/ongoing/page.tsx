import { AnimeCard } from '@/components/AnimeCard';
import { Pager } from '@/components/Pager';
import { getOngoing } from '@/lib/otakudesu';

export const metadata = { title: 'Anime Ongoing' };

export default async function OngoingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || 1) || 1);
  const data = await getOngoing(page);
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#a894ff]">Update terbaru</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Anime Ongoing</h1>
        <p className="mt-2 text-sm text-white/45">Anime yang masih tayang dan diperbarui secara berkala.</p>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {data.items.map((anime) => <AnimeCard key={anime.slug} anime={anime} />)}
      </div>
      <Pager page={data.page} hasNext={data.hasNext} basePath="/ongoing" />
    </div>
  );
}
