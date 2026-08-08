import Image from 'next/image';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import type { AnimeCardData } from '@/lib/otakudesu';

export function AnimeCard({ anime }: { anime: AnimeCardData }) {
  return (
    <Link href={`/anime/${anime.slug}`} className="group block min-w-0">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-[#15171d] shadow-[0_18px_50px_rgba(0,0,0,.22)]">
        {anime.thumb ? (
          <Image
            src={anime.thumb}
            alt={anime.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition duration-500 group-hover:scale-[1.045]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-white/30">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-70" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-xl">
            <Play className="h-5 w-5 fill-black" />
          </span>
        </div>
        <div className="absolute left-2 top-2 flex max-w-[80%] flex-wrap gap-1.5">
          {anime.status && (
            <span className="rounded-full border border-white/15 bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
              {anime.status}
            </span>
          )}
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
          {anime.episode && (
            <span className="rounded-lg bg-[#7057ff] px-2 py-1 text-[10px] font-extrabold text-white shadow-lg">
              {anime.episode}
            </span>
          )}
          {anime.rating && (
            <span className="ml-auto flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
              <Star className="h-3 w-3 fill-[#ffd66b] text-[#ffd66b]" /> {anime.rating}
            </span>
          )}
        </div>
      </div>
      <div className="px-1 pt-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[#f2f2f5] transition group-hover:text-[#b9aaff]">
          {anime.title}
        </h3>
        <p className="mt-1 text-xs text-white/40">
          {anime.updatedOn ? `Update ${anime.updatedOn}` : anime.genres?.slice(0, 2).join(' • ') || 'Subtitle Indonesia'}
        </p>
      </div>
    </Link>
  );
}
