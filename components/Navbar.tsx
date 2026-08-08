'use client';

import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/ongoing', label: 'Ongoing' },
  { href: '/completed', label: 'Completed' },
  { href: '/favorites', label: 'Favorit' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;
    router.push(`/search?q=${encodeURIComponent(value)}`);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#08090c]/82 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#8b73ff] to-[#5d43df] font-black text-white shadow-[0_8px_28px_rgba(112,87,255,.35)]">Z</span>
          <span className="text-lg font-black tracking-tight text-white">ZNN Anime</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${active ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden w-full max-w-sm md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari anime..."
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[.045] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#8b73ff]/70 focus:bg-white/[.065]"
            />
          </div>
        </form>

        <button onClick={() => setOpen((v) => !v)} className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white md:ml-0 lg:hidden" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/8 bg-[#0b0c10] px-4 py-4 lg:hidden">
          <form onSubmit={submit} className="mb-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari anime..." className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30" />
            </div>
          </form>
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
