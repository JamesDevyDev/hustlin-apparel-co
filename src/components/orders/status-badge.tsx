import type { OrderStatus } from "@/types/order";

const STYLES: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Awaiting verification", className: "border-black/40 text-black/70" },
  verified: { label: "Verified", className: "border-green-700 text-green-700" },
  rejected: { label: "Rejected", className: "border-red-600 text-red-600" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-block border px-2 py-0.5 text-[11px] uppercase tracking-wider ${s.className}`}>
      {s.label}
    </span>
  );
}
