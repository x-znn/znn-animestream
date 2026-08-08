import Link from 'next/link';
import { AlertTriangle, ChevronLeft, ChevronRight, ListVideo, MonitorPlay } from 'lucide-react';
import { WatchTracker } from '@/components/WatchTracker';
import { getAnimeDetail, getAnimeStream } from '@/lib/otakudesu';

export const dynamic = 'force-dynamic';

export default async function WatchPage({ params, searchParams }: { params: Promise<{ episode: string }>; searchParams: Promise<{ anime?: string }> }) {
  const [{ episode }, sp] = await Promise.all([params, searchParams]);
  const animeSlug = String(sp.anime || '').trim();

  if (!animeSlug) {
    return <Message title="Data anime tidak lengkap" text="Buka episode melalui halaman detail anime agar navigasi episode tetap tersedia." />;
  }

  const [anime, stream] = await Promise.all([
    getAnimeDetail(animeSlug),
    getAnimeStream(episode),
  ]);

  const index = anime.episodes.findIndex((ep) => ep.slug === episode);
  const prev = index > 0 ? anime.episodes[index - 1] : null;
  const next = index >= 0 && index < anime.episodes.length - 1 ? anime.episodes[index + 1] : null;
  const current = index >= 0 ? anime.episodes[index] : null;
  const episodeTitle = stream.title || current?.title || 'Episode';

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <WatchTracker animeSlug={animeSlug} animeTitle={anime.title} poster={anime.thumb} episodeSlug={episode} episodeTitle={episodeTitle} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link href={`/anime/${animeSlug}`} className="text-xs font-bold text-[#a894ff] hover:text-white">← {anime.title}</Link>
          <h1 className="mt-2 line-clamp-2 text-xl font-black text-white sm:text-2xl">{episodeTitle}</h1>
        </div>
        <Link href={`/anime/${animeSlug}`} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white">
          <ListVideo className="h-4 w-4" /> Semua episode
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_30px_90px_rgba(0,0,0,.4)]">
        <div className="aspect-video w-full bg-black">
          {stream.streamLink ? (
            <iframe
              src={stream.streamLink}
              title={episodeTitle}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer"
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white/45">
              <MonitorPlay className="h-10 w-10 text-white/20" />
              <p className="text-sm">Link stream tidak tersedia untuk episode ini.</p>
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        {prev ? (
          <Link href={`/watch/${prev.slug}?anime=${encodeURIComponent(animeSlug)}`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-white transition hover:bg-white/10">
            <ChevronLeft className="h-4 w-4" /> Episode {prev.number ?? ''}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/watch/${next.slug}?anime=${encodeURIComponent(animeSlug)}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#7057ff] px-4 text-sm font-black text-white transition hover:bg-[#806cff]">
            Episode {next.number ?? ''} <ChevronRight className="h-4 w-4" />
          </Link>
        ) : <span />}
      </div>

      <section className="rounded-2xl border border-white/9 bg-white/[.025] p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-white/70"><AlertTriangle className="h-4 w-4 text-[#a894ff]" /> Player bermasalah?</div>
        <p className="mt-2 text-xs leading-5 text-white/40">Coba refresh halaman atau pilih episode lagi. Link player diambil ulang setiap halaman watch dibuka.</p>
      </section>
    </div>
  );
}

function Message({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/[.025] p-8 text-center">
      <h1 className="text-xl font-black text-white">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-white/45">{text}</p>
      <Link href="/" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black">Ke beranda</Link>
    </div>
  );
}
