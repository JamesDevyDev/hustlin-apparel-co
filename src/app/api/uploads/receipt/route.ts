import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Choose a receipt image." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "Only image files are accepted." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "Receipt must be 10 MB or smaller." }, { status: 400 });
    }

    const uploaded = await uploadToCloudinary(file);
    return Response.json(uploaded);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Receipt upload failed." }, { status: 500 });
  }
}
