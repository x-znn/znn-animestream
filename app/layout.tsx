import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { JoinChannelPopup } from '@/components/JoinChannelPopup';

export const metadata: Metadata = {
  title: { default: 'ZNN Animestream', template: '%s | ZNN Animestream' },
  description: 'Streaming anime subtitle Indonesia dengan katalog ongoing, completed, pencarian, dan daftar episode.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="site-glow" />
        <Navbar />
        <JoinChannelPopup />
        <main className="mx-auto min-h-[calc(100vh-160px)] w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">{children}</main>
        <footer className="border-t border-white/8 py-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-white/35 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 znn_id</p>
            <p>Powered by api.znn.my.id</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
