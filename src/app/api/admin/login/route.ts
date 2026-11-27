import { NextRequest } from "next/server";
import { ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { createAdminSession, verifyPassword } from "@/lib/admin-auth";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const { password } = await request.json();
    if (typeof password !== "string" || !password) return Response.json({ error: "Password is required." }, { status: 400 });
    const result = await getPool().query("SELECT value FROM store_settings WHERE key='admin_password'");
    if (!result.rowCount) return Response.json({ error: "Admin password is not configured. Set ADMIN_INITIAL_PASSWORD and restart the app." }, { status: 503 });
    if (!(await verifyPassword(password, result.rows[0].value))) return Response.json({ error: "Incorrect password." }, { status: 401 });
    await createAdminSession();
    return Response.json({ authenticated: true });
  } catch { return Response.json({ error: "Unable to sign in." }, { status: 500 }); }
}
