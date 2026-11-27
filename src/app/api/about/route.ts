import { NextRequest } from "next/server";
import { getAboutContent, ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const about = await getAboutContent();
    return Response.json(about);
  } catch {
    return Response.json({ error: "Unable to load about content." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    await ensureSchema();
    const body = await request.json();
    const header = typeof body.header === "string" ? body.header.trim() : "";
    const content = typeof body.body === "string" ? body.body.trim() : "";

    // Clearing both fields removes the About section from the public shop page.
    if (!header && !content) {
      await getPool().query("DELETE FROM store_settings WHERE key='about'");
      return Response.json(null);
    }
    if (!header || !content) return Response.json({ error: "Enter both a header and body, or clear both to hide the section." }, { status: 400 });
    if (header.length > 160 || content.length > 12000) return Response.json({ error: "Content is too long." }, { status: 400 });

    const value = { header, body: content };
    await getPool().query(
      "INSERT INTO store_settings(key,value) VALUES('about',$1) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value",
      [JSON.stringify(value)]
    );
    return Response.json(value);
  } catch {
    return Response.json({ error: "Unable to save about content." }, { status: 500 });
  }
}
