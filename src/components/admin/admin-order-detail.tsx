"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderStatusBadge } from "@/components/orders/status-badge";
import { getOrderById, reviewOrder } from "@/lib/services/order-service";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/order";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });

export function AdminOrderDetail({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrderById(id).then(setOrder);
  }, [id]);

  if (order === undefined) return <p className="text-sm" aria-busy="true">Loading…</p>;

  if (order === null) {
    return (
      <p className="text-sm">
        Order not found.{" "}
        <Link href="/admin/orders" className="underline underline-offset-4">Back to orders</Link>
      </p>
    );
  }

  async function decide(decision: "verified" | "rejected") {
    if (!order) return;
    const message =
      decision === "verified"
        ? `Confirm that you received ${formatPrice(order.total)} and verify this order?`
        : "Reject this order? The items will be returned to stock.";
    if (!window.confirm(message)) return;

    setBusy(true);
    setError("");
    try {
      setOrder(await reviewOrder(order.id, decision));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const c = order.customer;

  return (
    <>
      <Link href="/admin/orders" className="text-[13px] underline underline-offset-4">← All orders</Link>

      <div className="mb-8 mt-6 flex flex-wrap items-center gap-4">
        <h1 className="text-sm uppercase tracking-[0.18em]">Order {order.id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-10 md:grid-cols-2 md:gap-[60px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-[11px] uppercase">Customer</h2>
            <p className="text-sm">{c.fullName}</p>
            <p className="text-sm">{c.email}</p>
            <p className="text-sm">{c.phone}</p>
            <p className="mt-3 text-sm">{c.address}</p>
            <p className="text-sm">{c.city}, {c.province} {c.postalCode}</p>
            {c.notes && <p className="mt-3 text-sm text-black/70">Note: {c.notes}</p>}
          </section>

          <section>
            <h2 className="mb-3 text-[11px] uppercase">Items</h2>
            <ul className="border-t border-black/15">
              {order.items.map((line) => {
                const optionText = Object.entries(line.options).map(([k, v]) => `${k}: ${v}`).join(", ");
                return (
                  <li key={line.id} className="flex justify-between gap-4 border-b border-black/15 py-3 text-sm">
                    <div>
                      <p className="uppercase">{line.name}</p>
                      {optionText && <p className="text-[13px] text-black/60">{optionText}</p>}
                      <p className="text-[13px] text-black/60">{line.quantity} × {formatPrice(line.price)}</p>
                    </div>
                    <p className="tracking-wider">{formatPrice(line.price * line.quantity)}</p>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              {order.shippingFee > 0 && (
                <div className="flex justify-between"><dt>Delivery</dt><dd>{formatPrice(order.shippingFee)}</dd></div>
              )}
              <div className="flex items-baseline justify-between pt-1">
                <dt>Amount to match on the receipt</dt>
                <dd className="text-lg tracking-wider">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <p className="text-[13px] text-black/60">
            Placed {when(order.createdAt)}
            {order.reviewedAt && ` · Reviewed ${when(order.reviewedAt)}`}
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-[11px] uppercase">Payment receipt</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={order.receipt} alt={`Payment receipt for order ${order.id}`} className="w-full border border-black/15" />

          {order.status === "pending" && (
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => decide("verified")}
                className="h-11 flex-1 bg-black text-xs uppercase tracking-[0.2em] text-white hover:bg-black/80 disabled:bg-black/30"
              >
                Verify payment
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => decide("rejected")}
                className="h-11 flex-1 border-2 border-black text-xs uppercase tracking-[0.2em] hover:bg-surface disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          )}
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
      </div>
    </>
  );
}
