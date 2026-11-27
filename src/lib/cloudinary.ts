import { createHash } from "crypto";

const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;

export function cloudinaryPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("cloudinary.com")) return null;
    const path = parsed.pathname.split("/upload/")[1];
    if (!path) return null;
    const withoutVersion = path.replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch { return null; }
}

export async function deleteCloudinaryImages(urls: string[]) {
  if (!cloud || !key || !secret) return;
  const ids = [...new Set(urls.map(cloudinaryPublicId).filter((v): v is string => !!v))];
  for (const public_id of ids) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createHash("sha1").update(`public_id=${public_id}&timestamp=${timestamp}${secret}`).digest("hex");
    const body = new URLSearchParams({ public_id, timestamp, api_key: key, signature });
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: "POST", body });
    if (!res.ok) throw new Error("Cloudinary image deletion failed.");
  }
}

export async function uploadToCloudinary(file: File) {
  if (!cloud || !key || !secret) throw new Error("Cloudinary is not configured.");
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHash("sha1").update(`timestamp=${timestamp}${secret}`).digest("hex");
  const body = new FormData();
  body.append("file", file); body.append("timestamp", timestamp); body.append("api_key", key); body.append("signature", signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Cloudinary upload failed.");
  return { url: data.secure_url as string, publicId: data.public_id as string };
}
