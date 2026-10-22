/**
 * Client-side Image Compression Utility for Zarika Fine Jewelry.
 *
 * Automatically resizes and compresses high-resolution camera / phone photos
 * before converting to Base64 data URLs. This ensures:
 * 1. Image documents never exceed Cloud Firestore's strict 1 MB limit.
 * 2. Uploads and page loads are nearly instantaneous.
 * 3. Memory and bandwidth usage remain minimal.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/jpeg" | "image/webp";
}

export interface CompressResult {
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Converts a data URL to a standard browser Blob.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0]?.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1] || "");
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Resizes and compresses an image File or existing Data URL.
 */
export async function compressImage(
  source: File | string,
  options: CompressOptions = {},
): Promise<CompressResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    mimeType = "image/jpeg",
  } = options;

  let originalBytes = 0;
  let srcDataUrl = "";

  if (typeof source === "string") {
    srcDataUrl = source;
    // Estimate bytes from base64 length
    originalBytes = Math.round((source.length * 3) / 4);
  } else {
    originalBytes = source.size;
    srcDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(source);
    });
  }

  // Load image into an HTMLImageElement
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(new Error("Failed to load image for compression"));
    image.src = srcDataUrl;
  });

  // Calculate new aspect-ratio-preserved dimensions
  let { width, height } = img;
  if (width > maxWidth || height > maxHeight) {
    if (width / height > maxWidth / maxHeight) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    } else {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }

  // Draw onto canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }

  // Luxury white background for transparent PNGs converted to JPEG
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(img, 0, 0, width, height);

  // Export compressed data URL
  const compressedDataUrl = canvas.toDataURL(mimeType, quality);
  const compressedBytes = Math.round((compressedDataUrl.length * 3) / 4);

  return {
    dataUrl: compressedDataUrl,
    originalBytes,
    compressedBytes,
    width,
    height,
  };
}
