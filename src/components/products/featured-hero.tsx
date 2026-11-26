"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWallpapers } from "@/hooks/use-wallpapers";

const AUTOPLAY_MS = 5000;

/** Full-screen wallpaper slideshow shown above the shop grid. Renders nothing when there are none. */
export function FeaturedHero() {
  const wallpapers = useWallpapers();
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = wallpapers?.length ?? 0;

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el || count === 0) return;
      el.scrollTo({ left: ((i + count) % count) * el.clientWidth, behavior: "smooth" });
    },
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => goTo(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [count, paused, index, goTo]);

  // Break out of the 1000px page column, and cancel <main>'s top padding.
  const frame =
    "relative -mt-8 ml-[calc(50%-50vw)] mb-12 h-[calc(100svh-72px)] min-h-[420px] w-screen md:-mt-12";

  if (wallpapers === null || count === 0) return null;

  const arrow =
    "absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center bg-black/30 text-2xl text-white hover:bg-black/50 sm:grid";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className={`${frame} bg-black`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ul
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {wallpapers.map((w, i) => (
          <li
            key={w.id}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="relative h-full w-full shrink-0 snap-center"
          >
            {/* Plain img so any hotlinked wallpaper works. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={w.url}
              alt={w.title ?? ""}
              loading={i === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-16 pt-32 text-center text-white">
              {w.title && (
                <h2 className="text-3xl font-black uppercase leading-none tracking-[-0.04em] sm:text-5xl">
                  {w.title}
                </h2>
              )}
            </div>
          </li>
        ))}
      </ul>

      {count > 1 && (
        <>
          <button type="button" aria-label="Previous slide" onClick={() => goTo(index - 1)} className={`${arrow} left-4`}>‹</button>
          <button type="button" aria-label="Next slide" onClick={() => goTo(index + 1)} className={`${arrow} right-4`}>›</button>
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
            {wallpapers.map((w, i) => (
              <button
                key={w.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => goTo(i)}
                className={`h-2 w-2 rounded-full border border-white ${i === index ? "bg-white" : "bg-transparent"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
