import { NextRequest } from "next/server";
import { ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    await ensureSchema();
    const { id } = await params;
    const data = await request.json();
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const imageUrl = typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";
    const body = typeof data.body === "string" ? data.body.trim() : "";
    if (!title || !imageUrl || !body) return Response.json({ error: "Title, cover photo, and body are required." }, { status: 400 });
    if (!/^https?:\/\/\S+$/i.test(imageUrl) && !/^\/\S+$/.test(imageUrl)) return Response.json({ error: "Invalid cover photo URL." }, { status: 400 });
    const { rows } = await getPool().query(
      "UPDATE announcements SET title=$2,image_url=$3,body=$4 WHERE id=$1 RETURNING id,title,image_url,body,created_at",
      [id, title, imageUrl, body]
    );
    if (!rows[0]) return Response.json({ error: "Announcement not found." }, { status: 404 });
    const row = rows[0];
    return Response.json({ id: row.id, title: row.title, imageUrl: row.image_url, body: row.body, createdAt: row.created_at });
  } catch {
    return Response.json({ error: "Unable to update announcement." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    await ensureSchema();
    const { id } = await params;
    const result = await getPool().query("DELETE FROM announcements WHERE id=$1", [id]);
    if (!result.rowCount) return Response.json({ error: "Announcement not found." }, { status: 404 });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Unable to delete announcement." }, { status: 500 });
  }
}
