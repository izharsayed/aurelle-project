import { handleCreateOrder } from "./api/create-order";
import { handleCashfreeWebhook } from "./api/webhook";
import { handleVerifyOrder } from "./api/verify-order";
import { handleGetAdminOrders, handleUpdateOrderStatus } from "./api/admin-orders";
import { seedAuthoritativeCatalog } from "./catalog";

// Auto-seed catalog on first request (pass env so Firebase is properly initialized)
let seedAttempted = false;
function triggerCatalogSeed(env?: any) {
  if (!seedAttempted) {
    seedAttempted = true;
    seedAuthoritativeCatalog(env).catch(() => {});
  }
}

/**
 * Unified Server Request Handler for all API routes
 */
export async function handleApiRoute(request: Request, env?: any): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) {
    return null;
  }

  triggerCatalogSeed(env);

  const jsonHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-webhook-signature, x-webhook-timestamp",
  };

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: jsonHeaders });
  }

  try {
    // 1. Create Cashfree Order
    if (pathname === "/api/payments/create-order" && request.method === "POST") {
      const body = await request.json();
      const result = await handleCreateOrder(body, request.url, env);
      return new Response(JSON.stringify(result), { status: 200, headers: jsonHeaders });
    }

    // 2. Cashfree Webhook
    if (pathname === "/api/payments/cashfree/webhook" && request.method === "POST") {
      const rawBody = await request.text();
      const signature = request.headers.get("x-webhook-signature");
      const timestamp = request.headers.get("x-webhook-timestamp");

      const result = await handleCashfreeWebhook(rawBody, signature, timestamp);
      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: jsonHeaders,
      });
    }

    // 3. Verify Order Payment Status
    if (pathname === "/api/payments/verify-order" && request.method === "GET") {
      const orderId = url.searchParams.get("orderId") || "";
      const result = await handleVerifyOrder(orderId);
      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: jsonHeaders,
      });
    }

    // 4. Admin: Get Orders
    if (pathname === "/api/admin/orders" && request.method === "GET") {
      const result = await handleGetAdminOrders();
      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: jsonHeaders,
      });
    }

    // 5. Admin: Update Fulfillment Status
    if (pathname === "/api/admin/orders/status" && request.method === "POST") {
      const body = await request.json();
      const result = await handleUpdateOrderStatus(body.orderId, body.status);
      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: jsonHeaders,
      });
    }

    // 6. Catalog: Get All Products
    if (pathname === "/api/catalog/products" && request.method === "GET") {
      const { handleGetCatalogProducts } = await import("./api/catalog-api");
      const result = await handleGetCatalogProducts(env);
      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: jsonHeaders,
      });
    }

    // 7. Catalog: Save/Update Product
    if (pathname === "/api/catalog/products" && request.method === "POST") {
      const { handleSaveCatalogProduct } = await import("./api/catalog-api");
      const body = await request.json();
      const result = await handleSaveCatalogProduct(body, env);
      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: jsonHeaders,
      });
    }

    // 8. Catalog: Delete Product
    if (pathname === "/api/catalog/products" && request.method === "DELETE") {
      const { handleDeleteCatalogProduct } = await import("./api/catalog-api");
      const id = url.searchParams.get("id") || "";
      const result = await handleDeleteCatalogProduct(id, env);
      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: jsonHeaders,
      });
    }

    // 9. Media: Upload Image (Cloudflare R2)
    if (pathname === "/api/upload" && request.method === "POST") {
      const { handleUploadMedia } = await import("./api/upload-media");
      const result = await handleUploadMedia(request, env);
      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: jsonHeaders,
      });
    }

    // 10. Media: Serve Image Stream (Cloudflare R2)
    if (pathname.startsWith("/api/media/") && request.method === "GET") {
      const { handleGetMedia } = await import("./api/upload-media");
      return await handleGetMedia(request, env);
    }

    // 11. Debug: Check which env vars are present in this Worker
    if (pathname === "/api/debug/env" && request.method === "GET") {
      const envCheck: Record<string, boolean> = {
        FIREBASE_PROJECT_ID: !!(env as any)?.FIREBASE_PROJECT_ID || !!process.env["FIREBASE_PROJECT_ID"],
        FIREBASE_CLIENT_EMAIL: !!(env as any)?.FIREBASE_CLIENT_EMAIL || !!process.env["FIREBASE_CLIENT_EMAIL"],
        FIREBASE_PRIVATE_KEY: !!(env as any)?.FIREBASE_PRIVATE_KEY || !!process.env["FIREBASE_PRIVATE_KEY"],
        SUPABASE_URL: !!(env as any)?.SUPABASE_URL || !!process.env["SUPABASE_URL"],
        SUPABASE_KEY: !!(env as any)?.SUPABASE_KEY || !!process.env["SUPABASE_KEY"],
        SUPABASE_BUCKET: !!(env as any)?.SUPABASE_BUCKET || !!process.env["SUPABASE_BUCKET"],
        CASHFREE_APP_ID: !!(env as any)?.CASHFREE_APP_ID || !!process.env["CASHFREE_APP_ID"],
      };
      return new Response(JSON.stringify({ env: envCheck }), { status: 200, headers: jsonHeaders });
    }

    // Unhandled /api route
    return new Response(JSON.stringify({ error: `Not found: ${pathname}` }), {
      status: 404,
      headers: jsonHeaders,
    });
  } catch (err: any) {
    console.error(`❌ [API Error] ${request.method} ${pathname}:`, err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}
