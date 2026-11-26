import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <>
      <h1 className="mb-8 text-sm uppercase tracking-[0.18em]">Cart</h1>
      <CartView />
    </>
  );
}
