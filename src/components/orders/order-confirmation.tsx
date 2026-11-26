"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getOrderById } from "@/lib/services/order-service";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/order";
import { OrderStatusBadge } from "./status-badge";

const MESSAGE = {
  pending:
    "Thank you! We received your receipt. We'll confirm your order as soon as your payment is verified.",
  verified: "Your payment is verified. We're getting your order ready.",
  rejected:
    "We couldn't verify your payment. Please contact us and mention your order number.",
} as const;

export function OrderConfirmation({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    getOrderById(id).then(setOrder);
  }, [id]);

  if (order === undefined) return <div className="h-40" aria-busy="true" />;

  if (order === null) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm">We couldn’t find that order.</p>
        <Link href="/shop" className="mt-4 inline-block text-sm underline underline-offset-4">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-sm uppercase tracking-[0.18em]">Order placed</h1>
      <p className="mt-6 text-sm">Order number</p>
      <p className="text-2xl tracking-wider">{order.id}</p>
      <div className="mt-3"><OrderStatusBadge status={order.status} /></div>
      <p className="mt-4 text-sm">{MESSAGE[order.status]}</p>

      <ul className="mt-8 border-t border-black/15">
        {order.items.map((line) => {
          const optionText = Object.entries(line.options).map(([k, v]) => `${k}: ${v}`).join(", ");
          return (
            <li key={line.id} className="flex justify-between gap-4 border-b border-black/15 py-3 text-sm">
              <div>
                <p className="uppercase">{line.name}</p>
                {optionText && <p className="text-[13px] text-black/60">{optionText}</p>}
                <p className="text-[13px] text-black/60">Qty {line.quantity}</p>
              </div>
              <p className="tracking-wider">{formatPrice(line.price * line.quantity)}</p>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 flex items-baseline justify-between text-sm">
        <span>Total paid</span>
        <span className="text-lg tracking-wider">{formatPrice(order.total)}</span>
      </p>

      <p className="mt-8 text-[13px] text-black/60">
        Delivering to {order.customer.fullName}, {order.customer.address}, {order.customer.city}, {order.customer.province} {order.customer.postalCode}
      </p>

      <Link
        href="/shop"
        className="mt-8 inline-block h-11 bg-black px-8 text-xs uppercase leading-[44px] tracking-[0.2em] text-white hover:bg-black/80"
      >
        Continue shopping
      </Link>
    </div>
  );
}
