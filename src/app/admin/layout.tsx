import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSchema } from "@/lib/db/queries";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureSchema();
  if (!(await isAdminAuthenticated())) redirect("/admin-login");
  return <div><AdminNav />{children}</div>;
}
