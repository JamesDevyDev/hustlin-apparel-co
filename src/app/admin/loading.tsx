export default function AdminLoading() {
  return (
    <section aria-label="Loading admin dashboard" aria-busy="true" className="space-y-6 p-5 md:p-8">
      <span className="sr-only">Loading admin dashboard…</span>
      <div className="flex items-center justify-between gap-4">
        <div className="h-7 w-44 rounded bg-neutral-200 motion-safe:animate-pulse" />
        <div className="h-9 w-28 rounded bg-neutral-200 motion-safe:animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 rounded border border-neutral-200 bg-neutral-100 motion-safe:animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-10 rounded bg-neutral-100 motion-safe:animate-pulse" />
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-14 rounded bg-neutral-100 motion-safe:animate-pulse" />
        ))}
      </div>
    </section>
  );
}
