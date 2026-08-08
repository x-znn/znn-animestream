import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { AnimeCard } from '@/components/AnimeCard';
import { ContinueWatching } from '@/components/ContinueWatching';
import { SectionTitle } from '@/components/SectionTitle';
import { getHomeData } from '@/lib/otakudesu';

export default async function HomePage() {
  try {
    const { ongoing, completed } = await getHomeData();
    const hero = ongoing.items[0] || completed.items[0];

    return (
      <div className="space-y-12">
        {hero && (
          <section className="relative min-h-[380px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111218] shadow-[0_24px_80px_rgba(0,0,0,.35)] sm:min-h-[430px]">
            {hero.thumb && (
              <Image src={hero.thumb} alt={hero.title} fill priority className="object-cover object-center opacity-55" referrerPolicy="no-referrer" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b0f] via-[#0a0b0f]/82 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0f] via-transparent to-transparent" />
            <div className="relative z-10 flex min-h-[380px] max-w-2xl flex-col justify-end p-6 sm:min-h-[430px] sm:p-10 lg:p-12">
              <div className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.16em] text-[#b5a6ff]">
                <Sparkles className="h-4 w-4" /> Baru diperbarui
              </div>
              <h1 className="max-w-xl text-3xl font-black leading-tight tracking-[-.03em] text-white sm:text-5xl">{hero.title}</h1>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/65">
                {hero.episode && <span className="rounded-lg border border-white/10 bg-white/7 px-2.5 py-1.5">{hero.episode}</span>}
                {hero.status && <span className="rounded-lg border border-white/10 bg-white/7 px-2.5 py-1.5">{hero.status}</span>}
                <span className="rounded-lg border border-white/10 bg-white/7 px-2.5 py-1.5">Subtitle Indonesia</span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={`/anime/${hero.slug}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-black transition hover:bg-white/90">
                  <Play className="h-4 w-4 fill-current" /> Mulai nonton
                </Link>
                <Link href="/ongoing" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/12 bg-white/7 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/12">
                  Lihat ongoing <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        <ContinueWatching />

        <section>
          <SectionTitle title="Sedang tayang" subtitle="Episode terbaru subtitle Indonesia" href="/ongoing" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {ongoing.items.slice(0, 12).map((anime) => <AnimeCard key={anime.slug} anime={anime} />)}
          </div>
        </section>

        <section>
          <SectionTitle title="Sudah tamat" subtitle="Anime completed yang bisa kamu lanjutkan kapan saja" href="/completed" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {completed.items.slice(0, 12).map((anime) => <AnimeCard key={anime.slug} anime={anime} />)}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    return <ApiError error={error} />;
  }
}

function ApiError({ error }: { error: unknown }) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-red-400/15 bg-red-400/[.04] p-8 text-center">
      <h1 className="text-xl font-black text-white">Katalog belum bisa dimuat</h1>
      <p className="mt-2 text-sm leading-6 text-white/50">{error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data anime.'}</p>
      <Link href="/" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black">Coba lagi</Link>
    </div>
  );
}
