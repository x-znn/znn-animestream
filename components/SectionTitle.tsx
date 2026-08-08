import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function SectionTitle({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-white/40">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#a894ff] transition hover:text-white">
          Lihat semua <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
