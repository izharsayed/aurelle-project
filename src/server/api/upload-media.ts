/**
 * Media Upload Service — Supports Supabase Storage (100% Free, No Credit Card)
 * with Cloudflare R2 / local fallback.
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

  // Generate unique file path
  const safeName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
  const filename = `${Date.now()}-${safeName}`;

  // 1. Check for Supabase Storage (100% Free, No Credit Card)
  const supabaseUrl = env?.SUPABASE_URL || process.env["SUPABASE_URL"];
  const supabaseKey =
    env?.SUPABASE_KEY ||
    process.env["SUPABASE_KEY"] ||
    env?.SUPABASE_SERVICE_ROLE_KEY ||
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    env?.SUPABASE_ANON_KEY ||
    process.env["SUPABASE_ANON_KEY"];
  const supabaseBucket = env?.SUPABASE_BUCKET || process.env["SUPABASE_BUCKET"] || "products";

  if (supabaseUrl && supabaseKey) {
    try {
      const baseUrl = supabaseUrl.replace(/\/+$/, "");
      const uploadUrl = `${baseUrl}/storage/v1/object/${supabaseBucket}/${filename}`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          "Content-Type": fileType,
          "x-upsert": "true",
        },
        body: fileBuffer,
      });

      if (res.ok) {
        const publicUrl = `${baseUrl}/storage/v1/object/public/${supabaseBucket}/${filename}`;
        console.log(`✅ [Supabase Storage] Successfully uploaded: ${publicUrl}`);
        return {
          status: 200,
          body: {
            success: true,
            key: filename,
            url: publicUrl,
          },
        };
      } else {
        const errText = await res.text();
        console.warn(`⚠️ [Supabase Storage Upload Warning]: ${errText}`);
      }
    } catch (err: any) {
      console.error("❌ [Supabase Storage Error]:", err);
    }
  }

  // 2. Fallback: Cloudflare R2 binding if present
  const r2 = env?.R2_BUCKET;
  if (r2 && typeof r2.put === "function") {
    try {
      const key = `products/${filename}`;
      await r2.put(key, fileBuffer, {
        httpMetadata: {
          contentType: fileType,
          cacheControl: "public, max-age=31536000, immutable",
        },
      });

      console.log(`✅ [R2] Stored media: ${key}`);
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
    }
  }

  // 3. Fallback for local development if cloud storage is not yet configured
  console.log("ℹ️ Cloud storage not configured yet. Using local base64 fallback.");
  const base64Str = btoa(
    new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
  );
  const dataUrl = `data:${fileType};base64,${base64Str}`;

  return {
    status: 200,
    body: {
      success: true,
      key: filename,
      url: dataUrl,
    },
  };
}

export async function handleGetMedia(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  const key = url.pathname.replace(/^\/api\/media\//, "");

  if (!key) {
    return new Response(JSON.stringify({ error: "Missing media key" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const r2 = env?.R2_BUCKET;
  if (r2 && typeof r2.get === "function") {
    try {
      const object = await r2.get(key);
      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("ETag", object.httpEtag);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        return new Response(object.body, { headers });
      }
    } catch (err) {
      console.error(err);
    }
  }

  return new Response(JSON.stringify({ error: "Object not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
