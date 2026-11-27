"use client";

import { useEffect, useState } from "react";
import {
  getSettings,
  SETTINGS_CHANGED_EVENT,
  type Settings,
} from "@/lib/services/settings-service";

/** Returns null while loading. Updates when settings change. */
export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = () =>
      getSettings().then((s) => {
        if (!cancelled) setSettings(s);
      });
    refresh();
    window.addEventListener(SETTINGS_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(SETTINGS_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return settings;
}
