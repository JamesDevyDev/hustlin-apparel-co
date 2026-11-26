function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("We couldn't read that image. Try a JPG or PNG."));
    img.src = url;
  });
}

/**
 * Shrinks a receipt photo/screenshot to a small JPEG data URL so it fits in
 * browser storage (a phone screenshot can be several MB uncompressed).
 */
export async function fileToReceiptDataUrl(
  file: File,
  maxEdge = 1400,
  quality = 0.75,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image of your receipt (JPG or PNG).");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("That image is too large. Please choose one under 15 MB.");
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser can't process images.");
    ctx.fillStyle = "#fff"; // JPEG has no transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
