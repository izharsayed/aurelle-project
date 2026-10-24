import { handleCreateOrder } from "./api/create-order";
import { handleCashfreeWebhook } from "./api/webhook";
import { handleVerifyOrder } from "./api/verify-order";
import { handleGetAdminOrders, handleUpdateOrderStatus } from "./api/admin-orders";
import { seedAuthoritativeCatalog } from "./catalog";

export function resolveEnv(passedEnv?: any, request?: Request): any {
  const g = globalThis as any;
  const reqAny = request as any;
  return (
    passedEnv ||
    reqAny?.runtime?.cloudflare?.env ||
    reqAny?.env ||
    g.__env__ ||
    (typeof process !== "undefined" ? process.env : undefined) ||
    g
  );
}

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
export async function handleApiRoute(request: Request, passedEnv?: any): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) {
    return null;
  }

  const env = resolveEnv(passedEnv, request);
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

    // 11. WhatsApp Auth: Send OTP
    if (pathname === "/api/auth/send-whatsapp-otp" && request.method === "POST") {
      const { sendWhatsAppOtp } = await import("./whatsapp");
      const body = await request.json().catch(() => ({}));
      const result = await sendWhatsAppOtp(body.mobileNumber, env);
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: jsonHeaders,
      });
    }

    // 12. WhatsApp Auth: Verify OTP
    if (pathname === "/api/auth/verify-whatsapp-otp" && request.method === "POST") {
      const { verifyWhatsAppOtp } = await import("./whatsapp");
      const body = await request.json().catch(() => ({}));
      const result = await verifyWhatsAppOtp(body.mobileNumber, body.otp, env);
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: jsonHeaders,
      });
    }

    // 13. Analytics: Track Event
    if (pathname === "/api/analytics/track" && request.method === "POST") {
      const { recordAnalyticsEvent } = await import("./analytics");
      const body = await request.json().catch(() => ({}));
      const result = await recordAnalyticsEvent(body, env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    // 14. Analytics: Get Admin Stats
    if (pathname === "/api/admin/analytics" && request.method === "GET") {
      const { getAdminAnalytics } = await import("./analytics");
      const result = await getAdminAnalytics(env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    // 15. Coupons: Public Active Coupons List
    if (pathname === "/api/coupons" && request.method === "GET") {
      const { getActiveCoupons } = await import("./coupons");
      const coupons = await getActiveCoupons(env);
      return new Response(JSON.stringify(coupons), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    // 16. Coupons: Validate Coupon Code against cart subtotal
    if (pathname === "/api/coupons/validate" && request.method === "POST") {
      const { validateAndApplyCoupon } = await import("./coupons");
      const body = await request.json().catch(() => ({}));
      const result = await validateAndApplyCoupon(body.code, Number(body.subtotal) || 0, env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    // 17. Coupons Admin: Get All Coupons
    if (pathname === "/api/admin/coupons" && request.method === "GET") {
      const { getAllCoupons } = await import("./coupons");
      const coupons = await getAllCoupons(env);
      return new Response(JSON.stringify(coupons), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    // 18. Coupons Admin: Save (Create/Update) Coupon
    if (pathname === "/api/admin/coupons" && request.method === "POST") {
      const { saveCoupon } = await import("./coupons");
      const body = await request.json().catch(() => ({}));
      const result = await saveCoupon(body, env);
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: jsonHeaders,
      });
    }

    // 19. Coupons Admin: Toggle Status
    if (
      pathname.startsWith("/api/admin/coupons/") &&
      pathname.endsWith("/status") &&
      request.method === "PATCH"
    ) {
      const code = decodeURIComponent(
        pathname.replace("/api/admin/coupons/", "").replace("/status", ""),
      );
      const { toggleCouponStatus } = await import("./coupons");
      const body = await request.json().catch(() => ({}));
      const result = await toggleCouponStatus(code, Boolean(body.isActive), env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    // 20. Coupons Admin: Delete Coupon
    if (pathname.startsWith("/api/admin/coupons/") && request.method === "DELETE") {
      const code = decodeURIComponent(pathname.replace("/api/admin/coupons/", ""));
      const { deleteCoupon } = await import("./coupons");
      const result = await deleteCoupon(code, env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    // 15. Debug: Check which env vars are present in this Worker
    if (pathname === "/api/debug/env" && request.method === "GET") {
      const g = globalThis as any;
      const reqAny = request as any;
      const envCheck: Record<string, boolean> = {
        FIREBASE_PROJECT_ID: !!env?.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: !!env?.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: !!env?.FIREBASE_PRIVATE_KEY,
        SUPABASE_URL: !!env?.SUPABASE_URL,
        SUPABASE_KEY: !!env?.SUPABASE_KEY,
        SUPABASE_BUCKET: !!env?.SUPABASE_BUCKET,
        CASHFREE_APP_ID: !!env?.CASHFREE_APP_ID,
        WHATSAPP_TOKEN: !!env?.WHATSAPP_TOKEN,
        WHATSAPP_PHONE_NUMBER_ID: !!env?.WHATSAPP_PHONE_NUMBER_ID,
      };
      const diagnostics = {
        hasPassedEnv: !!passedEnv,
        hasGlobalEnv: !!g.__env__,
        hasReqCloudflareEnv: !!reqAny?.runtime?.cloudflare?.env,
        hasProcessEnv: typeof process !== "undefined" && !!process.env,
        keysInPassedEnv: passedEnv ? Object.keys(passedEnv) : [],
        keysInGlobalEnv: g.__env__ ? Object.keys(g.__env__) : [],
        keysInReqEnv: reqAny?.runtime?.cloudflare?.env ? Object.keys(reqAny.runtime.cloudflare.env) : [],
      };
      return new Response(JSON.stringify({ env: envCheck, diagnostics }), { status: 200, headers: jsonHeaders });
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
