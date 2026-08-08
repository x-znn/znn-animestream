import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pager({ page, hasNext, basePath }: { page: number; hasNext: boolean; basePath: string }) {
  const sep = basePath.includes('?') ? '&' : '?';
  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={`${basePath}${sep}page=${page - 1}`} className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </Link>
      ) : <span />}
      <span className="grid h-11 min-w-11 place-items-center rounded-xl bg-[#7057ff] px-3 text-sm font-black text-white">{page}</span>
      {hasNext ? (
        <Link href={`${basePath}${sep}page=${page + 1}`} className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
          Berikutnya <ChevronRight className="h-4 w-4" />
        </Link>
      ) : <span />}
    </div>
  );
}
