"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listOrders, ORDERS_CHANGED_EVENT } from "@/lib/services/order-service";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const refresh = () =>
      listOrders().then((o) => setPending(o.filter((x) => x.status === "pending").length));
    refresh();
    window.addEventListener(ORDERS_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(ORDERS_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [pathname]);

  const onFeatured = pathname.startsWith("/admin/featured");
  const onOrders = pathname.startsWith("/admin/orders");
  const onSettings = pathname.startsWith("/admin/settings");
  const onAnnouncements = pathname.startsWith("/admin/announcements");
  // Products owns everything else under /admin (list, add, edit).
  const onProducts = !onFeatured && !onOrders && !onSettings && !onAnnouncements;

  const tab = (active: boolean) =>
    `pb-2 text-xs uppercase tracking-[0.18em] ${active ? "border-b-2 border-black" : "text-black/50 hover:text-black"
    }`;
  const current = (active: boolean) => (active ? ("page" as const) : undefined);

  return (
    <nav aria-label="Admin" className="mb-10 flex gap-8 overflow-x-auto border-b border-black/15">
      <Link href="/admin" className={tab(onProducts)} aria-current={current(onProducts)}>
        Products
      </Link>
      <Link href="/admin/featured" className={tab(onFeatured)} aria-current={current(onFeatured)}>
        Featured
      </Link>
      <Link href="/admin/orders" className={tab(onOrders)} aria-current={current(onOrders)}>
        Orders
        {pending > 0 && (
          <span className="ml-2 inline-grid h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[10px] leading-none text-white">
            {pending}
          </span>
        )}
      </Link>
      <Link href="/admin/announcements" className={tab(onAnnouncements)} aria-current={current(onAnnouncements)}>
        Announcements
      </Link>
      <Link href="/admin/settings" className={tab(onSettings)} aria-current={current(onSettings)}>
        Settings
      </Link>
      <button type="button" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin-login"); router.refresh(); }} className="pb-2 text-xs uppercase tracking-[0.18em] text-black/50 hover:text-black">
        Sign out
      </button>
    </nav>
  );
}