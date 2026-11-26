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
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [category, setCategory] = useState(
    product?.category ?? categories[0]?.slug ?? "",
  );
  const [available, setAvailable] = useState(product?.available ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [features, setFeatures] = useState(product?.features.join("\n") ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [options, setOptions] = useState<OptionRow[]>(
    product?.options.map((o) => ({ name: o.name, values: o.values.join(", ") })) ??
    [],
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const setOption = (i: number, patch: Partial<OptionRow>) =>
    setOptions((prev) => prev.map((o, j) => (j === i ? { ...o, ...patch } : o)));

  function addImage() {
    const url = imageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      return setError("Image link must start with https:// (or / for a local file).");
    }
    if (images.includes(url)) return setError("That photo is already added.");
    setError("");
    setImages((prev) => [...prev, url]);
    setImageUrl("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const priceNumber = Number(price);
    if (!name.trim()) return setError("Name is required.");
    if (!price || !Number.isFinite(priceNumber) || priceNumber < 0) {
      return setError("Enter a valid price in pesos.");
    }

    const stockNumber = Number(stock);
    if (stock === "" || !Number.isInteger(stockNumber) || stockNumber < 0) {
      return setError("Stock must be a whole number, 0 or more.");
    }

    const data: ProductInput = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      price: Math.round(priceNumber),
      category,
      stock: stockNumber,
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="text-[13px]">Price (₱)</label>
          <input id="price" type="number" min={0} step={1} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="stock" className="text-[13px]">Stock</label>
          <input id="stock" type="number" min={0} step={1} inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} className={input} />
        </div>
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
        <div className="mt-2 flex gap-3">
          <input
            aria-label="Image link"
            placeholder="Paste image link, e.g. https://…/tee-front.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
            className={`${input} !mt-0`}
          />
          <button
            type="button"
            onClick={addImage}
            className="h-[46px] shrink-0 border-2 border-black px-6 text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white"
          >
            + Add photo
          </button>
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