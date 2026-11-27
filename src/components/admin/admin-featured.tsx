"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useWallpapers } from "@/hooks/use-wallpapers";
import {
  addWallpaper,
  moveWallpaper,
  removeWallpaper,
} from "@/lib/services/featured-service";
import { isValidImageLink } from "@/lib/services/settings-service";

const input =
  "mt-2 h-[46px] w-full rounded-[3px] border-2 border-black bg-surface px-3 text-base font-light";

export function AdminFeatured() {
  const wallpapers = useWallpapers();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [href, setHref] = useState("");
  const [displayType, setDisplayType] = useState<"desktop" | "mobile">("desktop");
  const [previewBroken, setPreviewBroken] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Image must be 10 MB or smaller."); return; }
    setError(""); setUploading(true);
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/admin/images", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      setUrl(result.url); setPreviewBroken(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Image upload failed."); }
    finally { setUploading(false); }
  }

  useEffect(() => setPreviewBroken(false), [url]);

  const trimmed = url.trim();
  const previewable = isValidImageLink(trimmed);

  async function run(action: () => Promise<unknown>) {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      await addWallpaper({ url: trimmed, title, href, displayType });
      setUrl("");
      setTitle("");
      setHref("");
      setDisplayType("desktop");
    });
  }

  return (
    <>
      <h1 className="text-sm uppercase tracking-[0.18em]">Featured</h1>
      <p className="mb-8 mt-2 text-[13px] text-black/60">
        Full-screen wallpapers shown as a slideshow above the product grid on the shop page. They are separate from your products.
        Add separate desktop and mobile images. Desktop images should be landscape (about 1920×1080); mobile images should be portrait (about 1080×1920). Visitors only see the version matching their screen size.
      </p>

      <form onSubmit={onAdd} noValidate className="max-w-xl space-y-5">
        <div>
          <label htmlFor="wp-display-type" className="text-[13px]">Image type</label>
          <select
            id="wp-display-type"
            value={displayType}
            onChange={(e) => setDisplayType(e.target.value as "desktop" | "mobile")}
            className={input}
          >
            <option value="desktop">Desktop / Landscape</option>
            <option value="mobile">Mobile / Portrait</option>
          </select>
          <p className="mt-1 text-xs text-black/60">Choose which screen size this image is intended for.</p>
        </div>
        <div>
          <label htmlFor="wp-url" className="text-[13px]">Wallpaper image link</label>
          <input
            id="wp-url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://…/wallpaper.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={input}
          />
          <label className="mt-3 inline-flex cursor-pointer border-2 border-black px-5 py-3 text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white">
            {uploading ? "Uploading…" : "+ Upload wallpaper"}
            <input type="file" accept="image/*" disabled={uploading} className="sr-only" onChange={(e) => { uploadImage(e.target.files?.[0]); e.currentTarget.value = ""; }} />
          </label>
          <p className="mt-2 text-xs text-black/60">Upload images (up to 10 MB). Stored in Cloudinary, or paste an image link above.</p>
        </div>

        {previewable && (
          <div className={`grid ${displayType === "mobile" ? "aspect-[9/16] max-w-[180px]" : "aspect-video max-w-[360px]"} w-full place-items-center bg-surface`}>
            {previewBroken ? (
              <p className="px-4 text-center text-[13px] text-black/50">Couldn&apos;t load an image from that link.</p>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={trimmed}
                src={trimmed}
                alt="Wallpaper preview"
                onError={() => setPreviewBroken(true)}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!trimmed || previewBroken || uploading}
          className="h-11 bg-black px-8 text-xs uppercase tracking-[0.2em] text-white hover:bg-black/80 disabled:bg-black/30"
        >
          Add wallpaper
        </button>
      </form>

      <section aria-labelledby="slides-heading" className="mt-12">
        <h2 id="slides-heading" className="text-[11px] uppercase">
          Slideshow{wallpapers ? ` (${wallpapers.length})` : ""}
        </h2>
        {wallpapers === null ? (
          <p className="mt-3 text-sm" aria-busy="true">Loading…</p>
        ) : wallpapers.length === 0 ? (
          <p className="mt-3 text-sm">No wallpapers yet. The shop shows just the product grid until you add one.</p>
        ) : (
          <ul className="mt-3 border-t border-black">
            {wallpapers.map((w, i) => (
              <li key={w.id} className="flex items-center gap-4 border-b border-black/15 py-3 text-sm">
                <div className={`${w.displayType === "mobile" ? "aspect-[9/16] w-14" : "aspect-video w-28"} shrink-0 bg-surface`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.url} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate uppercase">{w.title || <span className="normal-case text-black/50">No heading</span>}</p>
                  <p className="text-[11px] uppercase tracking-wider text-black/70">{w.displayType === "mobile" ? "Mobile / Portrait" : "Desktop / Landscape"}</p>
                  <p className="truncate text-[13px] text-black/60">Button → {w.href || "/shop"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-[13px]">
                  <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => run(() => moveWallpaper(w.id, -1))} className="disabled:opacity-30">↑</button>
                  <button type="button" aria-label="Move later" disabled={i === wallpapers.length - 1} onClick={() => run(() => moveWallpaper(w.id, 1))} className="disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => run(() => removeWallpaper(w.id))} className="underline underline-offset-4">Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
