"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

export function CartLink() {
  const { count, ready } = useCart();
  const shown = ready ? count : 0;
  return (
    <Link
      href="/cart"
      className="relative grid h-9 w-9 place-items-center"
      aria-label={`Cart, ${shown} ${shown === 1 ? "item" : "items"}`}
    >
      <ShoppingCart size={20} strokeWidth={1.75} />
      {shown > 0 && (
        <span className="absolute -right-0.5 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[10px] font-normal leading-none text-white">
          {shown}
        </span>
      )}
    </Link>
  );
}
