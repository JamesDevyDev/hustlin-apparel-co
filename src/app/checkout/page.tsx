import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <h1 className="mb-8 text-sm uppercase tracking-[0.18em]">Checkout</h1>
      <CheckoutView />
    </>
  );
}
