import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clock3, Play, Star, Tv2 } from 'lucide-react';
import { FavoriteButton } from '@/components/FavoriteButton';
import { getAnimeDetail } from '@/lib/otakudesu';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const anime = await getAnimeDetail(slug);
    return { title: anime.title, description: anime.sinopsis || `Nonton ${anime.title} subtitle Indonesia.` };
  } catch {
    return { title: 'Detail Anime' };
  }
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const anime = await getAnimeDetail(slug);
  const firstEpisode = anime.episodes[0];
  const info = anime.info;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#101116]">
        {anime.thumb && <Image src={anime.thumb} alt="" fill className="object-cover opacity-15 blur-2xl scale-110" referrerPolicy="no-referrer" />}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d11]/98 via-[#0c0d11]/90 to-[#0c0d11]/70" />
        <div className="relative z-10 grid gap-7 p-5 sm:p-8 md:grid-cols-[220px_1fr] lg:p-10">
          <div className="mx-auto w-full max-w-[220px] md:mx-0">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
              {anime.thumb && <Image src={anime.thumb} alt={anime.title} fill priority className="object-cover" referrerPolicy="no-referrer" />}
            </div>
          </div>

          <div className="min-w-0 self-center">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#a894ff]">Subtitle Indonesia</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-.025em] text-white sm:text-4xl">{anime.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/65">
              {info.skor && <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5"><Star className="h-3.5 w-3.5 fill-[#ffd66b] text-[#ffd66b]" /> {info.skor}</span>}
              {info.status && <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5"><Tv2 className="h-3.5 w-3.5" /> {info.status}</span>}
              {info.durasi && <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5"><Clock3 className="h-3.5 w-3.5" /> {info.durasi}</span>}
              {info.tanggal_rilis && <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5"><CalendarDays className="h-3.5 w-3.5" /> {info.tanggal_rilis}</span>}
            </div>

            {anime.sinopsis && <p className="mt-6 max-w-3xl text-sm leading-7 text-white/55 sm:text-[15px]">{anime.sinopsis}</p>}

            <div className="mt-7 flex flex-wrap gap-3">
              {firstEpisode && (
                <Link href={`/watch/${firstEpisode.slug}?anime=${encodeURIComponent(slug)}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-black transition hover:bg-white/90">
                  <Play className="h-4 w-4 fill-current" /> Mulai episode 1
                </Link>
              )}
              <FavoriteButton anime={{ slug, title: anime.title, poster: anime.thumb }} />
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/8 pt-6 text-sm sm:grid-cols-3 lg:grid-cols-4">
              {info.tipe && <div><dt className="text-xs uppercase tracking-wide text-white/30">Tipe</dt><dd className="mt-1 font-semibold text-white/75">{info.tipe}</dd></div>}
              {info.studio && <div><dt className="text-xs uppercase tracking-wide text-white/30">Studio</dt><dd className="mt-1 font-semibold text-white/75">{info.studio}</dd></div>}
              {info.total_episode && <div><dt className="text-xs uppercase tracking-wide text-white/30">Episode</dt><dd className="mt-1 font-semibold text-white/75">{info.total_episode}</dd></div>}
              {info.genre && <div className="col-span-2 sm:col-span-3 lg:col-span-1"><dt className="text-xs uppercase tracking-wide text-white/30">Genre</dt><dd className="mt-1 font-semibold text-white/75">{info.genre}</dd></div>}
            </dl>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">Daftar episode</h2>
            <p className="mt-1 text-sm text-white/40">{anime.totalEpisodes || anime.episodes.length} episode tersedia</p>
          </div>
        </div>
        {anime.episodes.length ? (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {anime.episodes.map((episode) => (
              <Link key={episode.slug} href={`/watch/${episode.slug}?anime=${encodeURIComponent(slug)}`} className="group flex items-center gap-3 rounded-2xl border border-white/9 bg-white/[.028] p-3 transition hover:border-[#7057ff]/45 hover:bg-white/[.05]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/6 text-sm font-black text-white/70 transition group-hover:bg-[#7057ff] group-hover:text-white">{episode.number ?? '•'}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white/80 group-hover:text-white">{episode.title}</p>
                  {episode.date && <p className="mt-1 text-xs text-white/35">{episode.date}</p>}
                </div>
                <Play className="h-4 w-4 shrink-0 text-white/20 transition group-hover:text-[#a894ff]" />
              </Link>
            ))}
          </div>
        ) : <div className="rounded-3xl border border-white/10 bg-white/[.025] py-16 text-center text-sm text-white/40">Belum ada episode.</div>}
      </section>
    </div>
  );
}
