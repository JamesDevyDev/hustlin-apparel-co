import { requireAdmin } from "@/lib/admin-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const authError = await requireAdmin(); if (authError) return authError;
  try {
    const form = await req.formData(); const file = form.get("file");
    if (!(file instanceof File)) return Response.json({error:"Choose an image."},{status:400});
    if (!file.type.startsWith("image/")) return Response.json({error:"Only image files are accepted."},{status:400});
    if (file.size > 10 * 1024 * 1024) return Response.json({error:"Image must be 10 MB or smaller."},{status:400});
    return Response.json(await uploadToCloudinary(file));
  } catch(e) { return Response.json({error:e instanceof Error?e.message:"Upload failed."},{status:500}); }
}
