"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderStatusBadge } from "@/components/orders/status-badge";
import { listOrders, ORDERS_CHANGED_EVENT } from "@/lib/services/order-service";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";

type Filter = "all" | OrderStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "pending", label: "To verify" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<Filter>("pending");

  useEffect(() => {
    const refresh = () => listOrders().then(setOrders);
    refresh();
    window.addEventListener(ORDERS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(ORDERS_CHANGED_EVENT, refresh);
  }, []);

  const count = (f: Filter) =>
    orders ? orders.filter((o) => f === "all" || o.status === f).length : 0;
  const shown = orders?.filter((o) => filter === "all" || o.status === filter) ?? [];

  return (
    <>
      <h1 className="mb-6 text-sm uppercase tracking-[0.18em]">Orders</h1>

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter orders">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`border px-3 py-1.5 text-[13px] ${
              filter === f.value ? "border-black bg-black text-white" : "border-black/25 hover:bg-surface"
            }`}
          >
            {f.label} ({count(f.value)})
          </button>
        ))}
      </div>

      {orders === null ? (
        <p className="text-sm" aria-busy="true">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm">No orders here yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black text-[11px] uppercase">
                <th className="py-3 pr-4 font-light">Order</th>
                <th className="py-3 pr-4 font-light">Date</th>
                <th className="py-3 pr-4 font-light">Customer</th>
                <th className="py-3 pr-4 font-light">Total</th>
                <th className="py-3 pr-4 font-light">Status</th>
                <th className="py-3 text-right font-light" />
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => (
                <tr key={o.id} className="border-b border-black/15">
                  <td className="py-3 pr-4 tracking-wider">{o.id}</td>
                  <td className="whitespace-nowrap py-3 pr-4">
                    {new Date(o.createdAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="py-3 pr-4">{o.customer.fullName}</td>
                  <td className="py-3 pr-4">{formatPrice(o.total)}</td>
                  <td className="py-3 pr-4"><OrderStatusBadge status={o.status} /></td>
                  <td className="py-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="underline underline-offset-4">
                      {o.status === "pending" ? "Review" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
