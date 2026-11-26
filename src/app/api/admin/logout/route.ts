import { clearCurrentAdminSession } from "@/lib/admin-auth";
export const runtime = "nodejs";
export async function POST() { try { await clearCurrentAdminSession(); return Response.json({ ok: true }); } catch { return Response.json({ error: "Unable to sign out." }, { status: 500 }); } }
