export default function ShopLoading() {
  return (
    <section aria-label="Loading products" aria-busy="true" className="space-y-8">
      <span className="sr-only">Loading products…</span>
      <div className="aspect-[16/7] w-full bg-neutral-200 motion-safe:animate-pulse" />
      <div className="mx-auto h-5 w-40 rounded bg-neutral-200 motion-safe:animate-pulse" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-[3/4] w-full bg-neutral-200 motion-safe:animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-neutral-200 motion-safe:animate-pulse" />
            <div className="h-3 w-2/5 rounded bg-neutral-100 motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
