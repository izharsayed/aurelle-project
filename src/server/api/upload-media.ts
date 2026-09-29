/**
 * Cloudflare R2 Media Upload & CDN Streaming Service
 *
 * Provides serverless image upload and edge streaming directly through Cloudflare R2
 * with zero egress fees and global CDN edge caching.
 */

export async function handleUploadMedia(
  request: Request,
  env: any,
): Promise<{ status: number; body: Record<string, any> }> {
  const contentType = request.headers.get("content-type") || "";

  let fileBuffer: ArrayBuffer | null = null;
  let fileType = "image/jpeg";
  let originalName = "upload.jpg";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return { status: 400, body: { error: "No file provided in form data" } };
    }
    fileBuffer = await file.arrayBuffer();
    fileType = file.type || "image/jpeg";
    originalName = file.name || "upload.jpg";
  } else if (contentType.includes("application/json")) {
    const json = (await request.json()) as {
      base64?: string;
      filename?: string;
      contentType?: string;
    };
    if (!json.base64) {
      return { status: 400, body: { error: "base64 image data is required" } };
    }
    const cleanBase64 = json.base64.replace(/^data:[^;]+;base64,/, "");
    const binaryStr = atob(cleanBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    fileBuffer = bytes.buffer;
    fileType = json.contentType || "image/jpeg";
    originalName = json.filename || "upload.jpg";
  } else {
    fileBuffer = await request.arrayBuffer();
    fileType = contentType || "image/jpeg";
  }

  if (!fileBuffer || fileBuffer.byteLength === 0) {
    return { status: 400, body: { error: "File data is empty" } };
  }

  // Generate clean S3/R2 key
  const safeName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
  const key = `products/${Date.now()}-${safeName}`;

  // Check if Cloudflare R2 binding is available
  const r2 = env?.R2_BUCKET;
  if (r2 && typeof r2.put === "function") {
    try {
      await r2.put(key, fileBuffer, {
        httpMetadata: {
          contentType: fileType,
          cacheControl: "public, max-age=31536000, immutable",
        },
      });

      console.log(`✅ [R2] Successfully stored media: ${key}`);
      return {
        status: 200,
        body: {
          success: true,
          key,
          url: `/api/media/${key}`,
        },
      };
    } catch (err: any) {
      console.error("❌ [R2 Upload Error]:", err);
      return { status: 500, body: { error: err.message || "Failed to upload to Cloudflare R2" } };
    }
  }

  // Fallback for local development if R2 binding is not configured in local environment
  console.log(
    "ℹ️ [R2] R2_BUCKET binding not found (local dev mode). Returning local base64 fallback.",
  );
  const base64Str = btoa(
    new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
  );
  const dataUrl = `data:${fileType};base64,${base64Str}`;

  return {
    status: 200,
    body: {
      success: true,
      key,
      url: dataUrl,
    },
  };
}

export async function handleGetMedia(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  // Match /api/media/{key...}
  const key = url.pathname.replace(/^\/api\/media\//, "");

  if (!key) {
    return new Response(JSON.stringify({ error: "Missing media key" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const r2 = env?.R2_BUCKET;
  if (!r2 || typeof r2.get !== "function") {
    return new Response(JSON.stringify({ error: "Cloudflare R2 binding not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const object = await r2.get(key);

    if (!object) {
      return new Response(JSON.stringify({ error: "Object not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("ETag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body, {
      headers,
    });
  } catch (err: any) {
    console.error(`❌ [R2 Stream Error for ${key}]:`, err);
    return new Response(JSON.stringify({ error: "Failed to retrieve media object" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
