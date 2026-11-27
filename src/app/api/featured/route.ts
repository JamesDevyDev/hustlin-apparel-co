import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { allWallpapers, ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json(await allWallpapers());
  } catch {
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    await ensureSchema();
    const body = await request.json();
    const url = String(body.url || "").trim();
    if (!(/^https?:\/\/\S+$/i.test(url) || /^\/\S+$/.test(url))) {
      return Response.json({ error: "Invalid image link." }, { status: 400 });
    }

    const href = String(body.href || "").trim();
    if (href && !/^(https?:\/\/|\/)\S*$/.test(href)) {
      return Response.json({ error: "Invalid button link." }, { status: 400 });
    }

    const displayType = body.displayType === "mobile" || body.displayType === "desktop"
      ? body.displayType
      : null;
    if (!displayType) {
      return Response.json({ error: "Choose desktop or mobile image type." }, { status: 400 });
    }

    const id = `wp_${randomUUID().slice(0, 12)}`;
    const position = Number((await getPool().query(
      "SELECT COALESCE(MAX(position), -1) + 1 AS n FROM featured_wallpapers"
    )).rows[0].n);

    const { rows } = await getPool().query(
      `INSERT INTO featured_wallpapers(id, url, title, href, display_type, position)
       VALUES($1, $2, $3, $4, $5, $6)
       RETURNING id, url, title, href, display_type AS "displayType"`,
      [id, url, body.title || null, href || null, displayType, position]
    );

    return Response.json(rows[0], { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Create failed" },
      { status: 400 }
    );
  }
}
