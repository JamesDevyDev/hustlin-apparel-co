export default function CheckoutLoading() {
  return (
    <section aria-label="Loading checkout" aria-busy="true" className="grid gap-12 md:grid-cols-[minmax(0,1fr)_380px] md:gap-[60px]">
      <span className="sr-only">Loading checkout…</span>
      <div className="space-y-6">
        <div className="h-4 w-36 rounded bg-neutral-200 motion-safe:animate-pulse" />
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-24 rounded bg-neutral-100 motion-safe:animate-pulse" />
            <div className="h-[46px] w-full rounded-sm border-2 border-neutral-200 bg-neutral-100 motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-4 w-32 rounded bg-neutral-200 motion-safe:animate-pulse" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-14 border-b border-neutral-200 bg-neutral-100 motion-safe:animate-pulse" />
          ))}
        </div>
        <div className="space-y-4 border-2 border-neutral-200 p-5">
          <div className="h-4 w-28 rounded bg-neutral-200 motion-safe:animate-pulse" />
          <div className="aspect-square max-w-[240px] bg-neutral-100 motion-safe:animate-pulse" />
          <div className="h-10 w-full bg-neutral-200 motion-safe:animate-pulse" />
        </div>
      </div>
    </section>
  );
}
