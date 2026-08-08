'use client';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-red-400/15 bg-red-400/[.035] p-8 text-center">
      <h1 className="text-xl font-black text-white">Gagal memuat halaman</h1>
      <p className="mt-2 text-sm leading-6 text-white/45">{error.message || 'API sedang tidak dapat dihubungi.'}</p>
      <button onClick={reset} className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black">Coba lagi</button>
    </div>
  );
}
