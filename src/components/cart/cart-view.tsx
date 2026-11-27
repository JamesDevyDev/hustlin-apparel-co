"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { listProducts } from "@/lib/services/product-service";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

export function CartView() {
  const { items, ready, subtotal, updateQuantity, removeItem } = useCart();
  const [stock, setStock] = useState<Record<string, number> | null>(null);

  // Live stock, so the steppers can't go past what is actually available.
  useEffect(() => {
    listProducts().then((list) =>
      setStock(Object.fromEntries(list.map((p) => [p.id, p.stock]))),
    );
  }, []);

  /** Most units this line can hold, given the other lines of the same product. */
  const maxFor = (line: (typeof items)[number]) => {
    if (!stock || stock[line.productId] === undefined) return undefined;
    const others = items
      .filter((l) => l.productId === line.productId && l.id !== line.id)
      .reduce((n, l) => n + l.quantity, 0);
    return Math.max(1, stock[line.productId] - others);
  };

  if (!ready) {
    return <div className="h-40" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block h-11 bg-black px-8 text-xs uppercase leading-[44px] tracking-[0.2em] text-white hover:bg-black/80"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className="border-t border-black/15">
        {items.map((line) => {
          const optionText = Object.entries(line.options)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          return (
            <li
              key={line.id}
              className="grid grid-cols-[80px_minmax(0,1fr)] gap-x-5 gap-y-4 border-b border-black/15 py-6 sm:grid-cols-[96px_minmax(0,1fr)_auto]"
            >
              <Link href={`/shop/${line.slug}`} aria-hidden tabIndex={-1}>
                <ProductImage src={line.image} alt="" sizes="96px" />
              </Link>

              <div className="min-w-0">
                <Link
                  href={`/shop/${line.slug}`}
                  className="text-[15px] uppercase leading-tight hover:opacity-60"
                >
                  {line.name}
                </Link>
                {optionText && <p className="mt-1 text-[13px] text-black/60">{optionText}</p>}
                <p className="mt-1 text-[13px] tracking-wider">{formatPrice(line.price)}</p>
                <div className="mt-4 flex items-center gap-5">
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(q) => updateQuantity(line.id, q)}
                    label={line.name}
                    max={maxFor(line)}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(line.id)}
                    className="text-[13px] underline underline-offset-4 hover:opacity-60"
                    aria-label={`Remove ${line.name}${optionText ? `, ${optionText}` : ""}`}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p className="col-start-2 text-[15px] tracking-wider sm:col-start-3 sm:text-right">
                {formatPrice(line.price * line.quantity)}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="ml-auto mt-8 max-w-[355px]">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px]">Subtotal</span>
          <span className="text-lg tracking-wider">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 text-[13px] text-black/60">
          Delivery fees are calculated at checkout.
        </p>
        <Link
          href="/checkout"
          className="mt-6 block h-11 w-full bg-black text-center text-xs uppercase leading-[44px] tracking-[0.2em] text-white transition-colors hover:bg-black/80"
        >
          Checkout
        </Link>
        <Link
          href="/shop"
          className="mt-4 block text-center text-[13px] underline underline-offset-4 hover:opacity-60"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
