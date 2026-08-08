export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded-xl bg-white/8" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-[2/3] rounded-2xl bg-white/6" />)}
      </div>
    </div>
  );
}
