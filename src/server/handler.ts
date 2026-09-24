import { handleCreateOrder } from "./api/create-order";
import { handleCashfreeWebhook } from "./api/webhook";
import { handleVerifyOrder } from "./api/verify-order";
import { handleGetAdminOrders, handleUpdateOrderStatus } from "./api/admin-orders";
import { seedAuthoritativeCatalog } from "./catalog";

// Auto-seed catalog on server startup
let seedAttempted = false;
function triggerCatalogSeed() {
  if (!seedAttempted) {
    seedAttempted = true;
    seedAuthoritativeCatalog().catch(() => {});
  }
}

/**
 * Unified Server Request Handler for all API routes
 */
export async function handleApiRoute(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) {
    return null;
  }

  triggerCatalogSeed();

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
      const result = await handleCreateOrder(body, request.url);
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

    // Unhandled /api route
    return new Response(JSON.stringify({ error: `Not found: ${pathname}` }), {
      status: 404,
      headers: jsonHeaders,
    });
  } catch (err: any) {
    console.error(`❌ [API Error] ${request.method} ${pathname}:`, err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: jsonHeaders },
    );
  }
}
