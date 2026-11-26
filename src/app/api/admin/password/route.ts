import { NextRequest } from "next/server";
import { ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { clearAdminSessions, hashPassword, requireAdmin, verifyPassword } from "@/lib/admin-auth";
export const runtime = "nodejs";
export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin(); if (denied) return denied;
  try {
    await ensureSchema();
    const { oldPassword, newPassword, confirmPassword } = await request.json();
    if ([oldPassword, newPassword, confirmPassword].some((v) => typeof v !== "string" || !v)) return Response.json({ error: "All password fields are required." }, { status: 400 });
    if (newPassword.length < 12) return Response.json({ error: "New password must be at least 12 characters." }, { status: 400 });
    if (newPassword !== confirmPassword) return Response.json({ error: "New password and confirmation do not match." }, { status: 400 });
    const result = await getPool().query("SELECT value FROM store_settings WHERE key='admin_password'");
    if (!result.rowCount || !(await verifyPassword(oldPassword, result.rows[0].value))) return Response.json({ error: "Old password is incorrect." }, { status: 400 });
    const hashed = await hashPassword(newPassword);
    await getPool().query("UPDATE store_settings SET value=$1 WHERE key='admin_password'", [JSON.stringify(hashed)]);
    await clearAdminSessions();
    return Response.json({ changed: true });
  } catch { return Response.json({ error: "Unable to change password." }, { status: 500 }); }
}
