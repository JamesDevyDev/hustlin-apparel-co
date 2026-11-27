import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureSchema();
    const { rows } = await getPool().query("SELECT id,title,image_url,body,created_at FROM announcements WHERE published=TRUE ORDER BY created_at DESC");
    return Response.json(rows.map((row) => ({ id: row.id, title: row.title, imageUrl: row.image_url, body: row.body, createdAt: row.created_at })));
  } catch {
    return Response.json({ error: "Unable to load announcements." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    await ensureSchema();
    const data = await request.json();
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const imageUrl = typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";
    const body = typeof data.body === "string" ? data.body.trim() : "";
    if (!title || !imageUrl || !body) return Response.json({ error: "Title, cover photo, and body are required." }, { status: 400 });
    if (!/^https?:\/\/\S+$/i.test(imageUrl) && !/^\/\S+$/.test(imageUrl)) return Response.json({ error: "Invalid cover photo URL." }, { status: 400 });
    if (title.length > 180 || body.length > 30000) return Response.json({ error: "Announcement content is too long." }, { status: 400 });
    const id = `ann_${randomUUID().slice(0, 12)}`;
    const { rows } = await getPool().query(
      "INSERT INTO announcements(id,title,image_url,body) VALUES($1,$2,$3,$4) RETURNING id,title,image_url,body,created_at",
      [id, title, imageUrl, body]
    );
    const row = rows[0];
    return Response.json({ id: row.id, title: row.title, imageUrl: row.image_url, body: row.body, createdAt: row.created_at }, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to create announcement." }, { status: 500 });
  }
}
