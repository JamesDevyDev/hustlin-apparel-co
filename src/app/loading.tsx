/**
 * Root route loading UI. Next.js displays this while a route segment is loading.
 */
export default function Loading() {
  return (
    <section aria-label="Loading page" aria-busy="true" className="space-y-8">
      <span className="sr-only">Loading page…</span>
      <div className="space-y-3 text-center">
        <div className="mx-auto h-3 w-24 rounded bg-neutral-200 motion-safe:animate-pulse" />
        <div className="mx-auto h-8 w-2/3 max-w-md rounded bg-neutral-200 motion-safe:animate-pulse" />
        <div className="mx-auto h-3 w-1/2 max-w-sm rounded bg-neutral-100 motion-safe:animate-pulse" />
      </div>
      <div className="aspect-[16/7] w-full rounded-sm bg-neutral-200 motion-safe:animate-pulse" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-[3/4] w-full bg-neutral-200 motion-safe:animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-neutral-200 motion-safe:animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-neutral-100 motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
