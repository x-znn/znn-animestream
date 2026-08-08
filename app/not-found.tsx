import Link from 'next/link';
export default function NotFound() {
  return <div className="py-24 text-center"><p className="text-sm font-bold text-[#a894ff]">404</p><h1 className="mt-2 text-3xl font-black text-white">Halaman tidak ditemukan</h1><Link href="/" className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black">Kembali</Link></div>;
}
