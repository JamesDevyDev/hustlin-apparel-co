"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useProduct, useRelatedProducts } from "@/hooks/use-products";
import { formatPrice, isInStock } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ProductList } from "./product-grid";

export function ProductDetail({ slug }: { slug: string }) {
  const product = useProduct(slug);
  const related = useRelatedProducts(product);
  const { items, addItem } = useCart();

  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  // Close the image viewer with Escape and prevent the page behind it from scrolling.
  useEffect(() => {
    if (!zoomedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomedImage(null);
        setIsZoomed(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomedImage]);

  // Reset the form when moving between products.
  useEffect(() => {
    setChosen({});
    setQuantity(1);
    setAdded(false);
    setZoomedImage(null);
    setIsZoomed(false);
  }, [slug]);

  if (product === undefined) {
    return (
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_355px] md:gap-[60px]">
        <ProductImage alt="" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm">We couldn’t find that product.</p>
        <Link href="/shop" className="mt-4 inline-block text-sm underline underline-offset-4">
          Back to shop
        </Link>
      </div>
    );
  }

  // First value of each option is preselected, as on the reference site.
  const selection: Record<string, string> = {};
  for (const opt of product.options) {
    selection[opt.name] = chosen[opt.name] ?? opt.values[0];
  }

  // Stock is shared across sizes, so count everything of this product in the cart.
  const inStock = isInStock(product);
  const inCart = items
    .filter((l) => l.productId === product.id)
    .reduce((n, l) => n + l.quantity, 0);
  const remaining = Math.max(0, product.stock - inCart);
  const qty = Math.min(quantity, Math.max(1, remaining));
  const canAdd = inStock && remaining > 0;

  const handleAdd = () => {
    addItem(product, selection, qty);
    setAdded(true);
  };

  return (
    <>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_355px] md:gap-[60px]">
        <div className="flex flex-col gap-6">
          {product.images.length > 0 ? (
            product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  setZoomedImage(src);
                  setIsZoomed(false);
                }}
                className="group relative block w-full cursor-zoom-in text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                aria-label={`Zoom image ${i + 1} of ${product.name}`}
              >
                <ProductImage
                  src={src}
                  alt={`${product.name}, view ${i + 1}`}
                  sizes="(min-width: 768px) 560px, 100vw"
                  priority={i === 0}
                  className="transition-opacity group-hover:opacity-90"
                />
                <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] uppercase tracking-wider text-black opacity-100 shadow-sm md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  Click to zoom
                </span>
              </button>
            ))
          ) : (
            <ProductImage alt={product.name} />
          )}
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <p className="text-[11px] uppercase">Hustlin Apparel Co.</p>
          <h1 className="mt-2 text-[22px] font-light uppercase leading-tight">
            {product.name}
          </h1>
          <p className="mt-2 text-lg tracking-wider">{formatPrice(product.price)}</p>

          <div className="mt-10 space-y-6">
            {product.options.map((opt) => (
              <div key={opt.name}>
                <label htmlFor={`opt-${opt.name}`} className="text-[13px]">
                  {opt.name}
                </label>
                <select
                  id={`opt-${opt.name}`}
                  value={selection[opt.name]}
                  onChange={(e) =>
                    setChosen((prev) => ({ ...prev, [opt.name]: e.target.value }))
                  }
                  className="mt-2 h-[46px] w-full rounded-[3px] border-2 border-black bg-surface px-3 text-base font-light"
                >
                  {opt.values.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div>
              <span className="text-[13px]">Quantity</span>
              <div className="mt-2">
                <QuantityStepper
                  value={qty}
                  onChange={setQuantity}
                  label={product.name}
                  max={Math.max(1, remaining)}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd}
              className="h-11 w-full bg-black text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/80 disabled:bg-black/30"
            >
              <span aria-live="polite">
                {!inStock
                  ? "Sold out"
                  : !canAdd
                    ? "All available stock is in your cart"
                    : added
                      ? "Added to cart"
                      : "Add to cart"}
              </span>
            </button>

            {inStock && (
              <p className={`text-[13px] ${product.stock <= 5 ? "text-red-600" : ""}`}>
                {product.stock <= 5
                  ? `Only ${product.stock} left`
                  : `${product.stock} in stock`}
              </p>
            )}

            {added && (
              <Link
                href="/cart"
                className="block text-center text-[13px] underline underline-offset-4"
              >
                View cart
              </Link>
            )}
          </div>

          {product.features.length > 0 && (
            <ul className="mt-12 space-y-1 text-sm">
              {product.features.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
          )}

          {product.sizeChart && (
            <div className="mt-10 overflow-x-auto">
              <table className="w-full border-collapse text-center text-[11px]">
                <caption className="sr-only">Size chart</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-8 pb-3" />
                    {product.sizeChart.columns.map((c) => (
                      <th key={c} scope="col" className="pb-3 font-light uppercase">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {product.sizeChart.rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="pr-2 font-light uppercase">
                        {row.label}
                      </th>
                      {row.values.map((v, i) => (
                        <td key={i} className="border border-black py-4">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Product image zoom"
          onClick={() => {
            setZoomedImage(null);
            setIsZoomed(false);
          }}
        >
          <button
            type="button"
            onClick={() => {
              setZoomedImage(null);
              setIsZoomed(false);
            }}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
            aria-label="Close image zoom"
          >
            ×
          </button>

          <div
            className="relative h-[85vh] w-full max-w-6xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={`relative h-full w-full ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              onClick={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - bounds.left) / bounds.width) * 100;
                const y = ((event.clientY - bounds.top) / bounds.height) * 100;
                setZoomOrigin({ x, y });
                setIsZoomed((current) => !current);
              }}
              onPointerMove={(event) => {
                if (!isZoomed) return;
                const bounds = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - bounds.left) / bounds.width) * 100;
                const y = ((event.clientY - bounds.top) / bounds.height) * 100;
                setZoomOrigin({ x, y });
              }}
              aria-label={isZoomed ? "Fit image to screen" : "Zoom in at selected point"}
            >
              <Image
                src={zoomedImage}
                alt={`${product.name} enlarged`}
                fill
                sizes="100vw"
                priority
                style={{ transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
                className={`object-contain transition-transform duration-150 ease-out ${
                  isZoomed ? "scale-[2.2]" : "scale-100"
                }`}
              />
            </button>
          </div>

          <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-[10px] uppercase tracking-widest text-white/80">
            Tap image to {isZoomed ? "fit" : "zoom in"} · Tap outside or press Esc to close
          </p>
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-8 text-center text-sm uppercase tracking-[0.18em]">
            You may also like
          </h2>
          <ProductList products={related} />
        </section>
      )}
    </>
  );
}
