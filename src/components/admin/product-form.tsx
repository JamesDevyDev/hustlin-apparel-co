"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { categories } from "@/data/categories";
import {
  createProduct,
  updateProduct,
  type ProductInput,
} from "@/lib/services/product-service";
import type { Product } from "@/types/product";

const field =
  "mt-2 w-full rounded-[3px] border-2 border-black bg-surface px-3 text-base font-light";
const input = `${field} h-[46px]`;

const lines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

interface OptionRow {
  name: string;
  values: string;
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stockBySize, setStockBySize] = useState<Record<string, string>>(() => {
    const existing = product?.stockBySize ?? {};
    if (Object.keys(existing).length) return Object.fromEntries(Object.entries(existing).map(([k, v]) => [k, String(v)]));
    const sizeValues = product?.options.find((o) => o.name.trim().toLowerCase() === "size")?.values ?? [];
    return sizeValues.length ? { [sizeValues[0]]: String(product?.stock ?? 0) } : { "": String(product?.stock ?? 0) };
  });
  const [category, setCategory] = useState(
    product?.category ?? categories[0]?.slug ?? "",
  );
  const [available, setAvailable] = useState(product?.available ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [features, setFeatures] = useState(product?.features.join("\n") ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [options, setOptions] = useState<OptionRow[]>(
    product?.options.map((o) => ({ name: o.name, values: o.values.join(", ") })) ??
    [],
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const setOption = (i: number, patch: Partial<OptionRow>) =>
    setOptions((prev) => prev.map((o, j) => (j === i ? { ...o, ...patch } : o)));

  async function uploadImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > 10 * 1024 * 1024) return setError("Image must be 10 MB or smaller.");
    setError(""); setUploadingImage(true);
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/admin/images", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      setImages((prev) => [...prev, result.url]);
    } catch (err) { setError(err instanceof Error ? err.message : "Image upload failed."); }
    finally { setUploadingImage(false); }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const priceNumber = Number(price);
    if (!name.trim()) return setError("Name is required.");
    if (!price || !Number.isFinite(priceNumber) || priceNumber < 0) {
      return setError("Enter a valid price in pesos.");
    }

    const sizeOption = options.find((o) => o.name.trim().toLowerCase() === "size");
    const sizeValues = sizeOption?.values.split(",").map((v) => v.trim()).filter(Boolean) ?? [];
    const stockKeys = sizeValues.length ? sizeValues : [""];
    const nextStock: Record<string, number> = {};
    for (const key of stockKeys) {
      const raw = stockBySize[key] ?? "0";
      const value = Number(raw);
      if (raw === "" || !Number.isInteger(value) || value < 0) return setError(`Stock for ${key || "default"} must be a whole number, 0 or more.`);
      nextStock[key] = value;
    }
    const stockNumber = Object.values(nextStock).reduce((sum, value) => sum + value, 0);

    const data: ProductInput = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      price: Math.round(priceNumber),
      category,
      stock: stockNumber,
      stockBySize: nextStock,
      available,
      featured,
      features: lines(features),
      images,
      options: options
        .map((o) => ({
          name: o.name.trim(),
          values: o.values.split(",").map((v) => v.trim()).filter(Boolean),
        }))
        .filter((o) => o.name && o.values.length > 0),
      // The form has no size chart editor yet, so keep whatever was there.
      sizeChart: product?.sizeChart,
    };

    setSaving(true);
    try {
      if (product) await updateProduct(product.id, data);
      else await createProduct(data);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-6">
      <div>
        <label htmlFor="name" className="text-[13px]">Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
      </div>

      <div>
        <label htmlFor="slug" className="text-[13px]">
          URL slug <span className="text-black/50">(blank = from name)</span>
        </label>
        <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className={input} />
      </div>

      <div>
        <label htmlFor="price" className="text-[13px]">Price (₱)</label>
        <input id="price" type="number" min={0} step={1} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={input} />
      </div>

      <div>
        <label htmlFor="category" className="text-[13px]">Category</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-8 text-[13px]">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          On sale <span className="text-black/50">(untick to hide from buying)</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>
      </div>

      <div>
        <label htmlFor="features" className="text-[13px]">
          Features <span className="text-black/50">(one per line)</span>
        </label>
        <textarea id="features" rows={5} value={features} onChange={(e) => setFeatures(e.target.value)} className={`${field} py-2`} />
      </div>

      <div>
        <span className="text-[13px]">Photos</span>
        {images.length > 0 && (
          <ul className="mt-2 grid grid-cols-3 gap-3">
            {images.map((src, i) => (
              <li key={`${src}-${i}`} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Product photo ${i + 1}`}
                  className="aspect-square w-full rounded-[3px] border-2 border-black object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="mt-1 text-[13px] underline underline-offset-4"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <label className="inline-flex cursor-pointer items-center border-2 border-black px-5 py-3 text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white">
            {uploadingImage ? "Uploading…" : "+ Upload photo"}
            <input type="file" accept="image/*" disabled={uploadingImage} className="sr-only" onChange={(e) => { uploadImage(e.target.files?.[0]); e.currentTarget.value = ""; }} />
          </label>
          <p className="mt-2 text-xs text-black/60">Upload images (up to 10 MB). Photos are stored in Cloudinary.</p>
        </div>
      </div>

      <fieldset>
        <legend className="text-[13px]">Options</legend>
        <div className="mt-2 space-y-3">
          {options.map((o, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] items-center gap-3">
              <input aria-label="Option name" placeholder="Size" value={o.name} onChange={(e) => setOption(i, { name: e.target.value })} className={`${input} !mt-0`} />
              <input aria-label="Option values" placeholder="S, M, L, XL" value={o.values} onChange={(e) => setOption(i, { values: e.target.value })} className={`${input} !mt-0`} />
              <button type="button" onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))} className="text-[13px] underline underline-offset-4">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setOptions((prev) => [...prev, { name: "", values: "" }])} className="mt-3 text-[13px] underline underline-offset-4">
          + Add option
        </button>
      </fieldset>

      <fieldset>
        <legend className="text-[13px]">Inventory by size</legend>
        <p className="mt-1 text-xs text-black/60">Add a Size option above (for example S, M, L), then enter the available quantity for each size.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(options.find((o) => o.name.trim().toLowerCase() === "size")?.values.split(",").map((v) => v.trim()).filter(Boolean) ?? [""]).map((size) => (
            <label key={size || "default"} className="text-[13px]">
              {size || "Default stock"}
              <input type="number" min={0} step={1} inputMode="numeric" value={stockBySize[size] ?? "0"} onChange={(e) => setStockBySize((prev) => ({ ...prev, [size]: e.target.value }))} className={input} />
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-black/60">Total: {Object.values(stockBySize).reduce((sum, value) => sum + (Number(value) || 0), 0)} units</p>
      </fieldset>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-6">
        <button type="submit" disabled={saving} className="h-11 bg-black px-8 text-xs uppercase tracking-[0.2em] text-white hover:bg-black/80 disabled:bg-black/30">
          {saving ? "Saving…" : product ? "Save changes" : "Add product"}
        </button>
        <Link href="/admin" className="text-[13px] underline underline-offset-4">Cancel</Link>
      </div>
    </form>
  );
}