"use client";

import { useEffect, useState } from "react";
import {
  FEATURED_CHANGED_EVENT,
  listWallpapers,
  type Wallpaper,
} from "@/lib/services/featured-service";

/** Returns null while loading. */
export function useWallpapers() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = () =>
      listWallpapers().then((list) => {
        if (!cancelled) setWallpapers(list);
      });
    refresh();
    window.addEventListener(FEATURED_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(FEATURED_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return wallpapers;
}
