import crypto from "node:crypto";

export interface CashfreeOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  returnUrl: string;
  notifyUrl: string;
  orderNote?: string;
}

export interface CashfreeOrderResult {
  cfOrderId: string;
  orderId: string;
  paymentSessionId: string;
  orderStatus: string;
  orderAmount: number;
  orderCurrency: string;
}

function getCashfreeConfig() {
  const appId = process.env["CASHFREE_APP_ID"] || "";
  const secretKey = process.env["CASHFREE_SECRET_KEY"] || "";
  const env = (process.env["CASHFREE_ENVIRONMENT"] || "sandbox").toLowerCase();
  const apiVersion = process.env["CASHFREE_API_VERSION"] || "2023-08-01";

  const baseUrl =
    env === "production"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

  const isConfigured = Boolean(appId && secretKey);

  return { appId, secretKey, env, apiVersion, baseUrl, isConfigured };
}

/**
 * Creates an order in Cashfree Payment Gateway to obtain a payment_session_id
 */
export async function createCashfreeOrder(
  params: CashfreeOrderParams,
): Promise<CashfreeOrderResult> {
  const config = getCashfreeConfig();

  // If live/sandbox credentials are not set up in .env yet, return a mock session for local DX
  if (!config.isConfigured) {
    console.warn(
      "⚠️ [Cashfree] CASHFREE_APP_ID or CASHFREE_SECRET_KEY missing in .env. Returning local simulated session.",
    );
    return {
      cfOrderId: `cf_mock_${Date.now()}`,
      orderId: params.orderId,
      paymentSessionId: `session_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      orderStatus: "ACTIVE",
      orderAmount: params.orderAmount,
      orderCurrency: params.orderCurrency || "INR",
    };
  }

  const payload = {
    order_id: params.orderId,
    order_amount: Number(params.orderAmount.toFixed(2)),
    order_currency: params.orderCurrency || "INR",
    customer_details: {
      customer_id: params.customer.id,
      customer_name: params.customer.name,
      customer_email: params.customer.email,
      customer_phone: params.customer.phone,
    },
    order_meta: {
      return_url: params.returnUrl,
      notify_url: params.notifyUrl,
      payment_methods: "cc,dc,upi,nb,app",
    },
    order_note: params.orderNote || "Velora Fine Jewelry Order",
  };

  const response = await fetch(`${config.baseUrl}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": config.appId,
      "x-client-secret": config.secretKey,
      "x-api-version": config.apiVersion,
    },
    body: JSON.stringify(payload),
  });

  const responseData = (await response.json()) as any;

  if (!response.ok) {
    const errorMsg =
      responseData?.["message"] || responseData?.["error"] || response.statusText || "Cashfree order creation failed";
    console.error("❌ [Cashfree Error]", response.status, responseData);
    throw new Error(`Cashfree Error: ${errorMsg}`);
  }

  return {
    cfOrderId: String(responseData?.["cf_order_id"] || ""),
    orderId: String(responseData?.["order_id"] || params.orderId),
    paymentSessionId: String(responseData?.["payment_session_id"] || ""),
    orderStatus: String(responseData?.["order_status"] || "ACTIVE"),
    orderAmount: Number(responseData?.["order_amount"] || params.orderAmount),
    orderCurrency: String(responseData?.["order_currency"] || "INR"),
  };
}

/**
 * Fetches current order details directly from Cashfree
 */
export async function getCashfreeOrder(orderId: string): Promise<Record<string, any> | null> {
  const config = getCashfreeConfig();
  if (!config.isConfigured) return null;

  try {
    const response = await fetch(`${config.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
      method: "GET",
      headers: {
        "x-client-id": config.appId,
        "x-client-secret": config.secretKey,
        "x-api-version": config.apiVersion,
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("❌ [Cashfree] Failed to query order:", err);
    return null;
  }
}

/**
 * Fetches all payments associated with an order from Cashfree
 */
export async function getCashfreePayments(orderId: string): Promise<any[]> {
  const config = getCashfreeConfig();
  if (!config.isConfigured) return [];

  try {
    const response = await fetch(`${config.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
      method: "GET",
      headers: {
        "x-client-id": config.appId,
        "x-client-secret": config.secretKey,
        "x-api-version": config.apiVersion,
      },
    });

    if (!response.ok) return [];
    return (await response.json()) as any[];
  } catch (err) {
    console.error("❌ [Cashfree] Failed to query payments:", err);
    return [];
  }
}

/**
 * Verifies Cashfree Webhook Signature according to official docs:
 * Signature = Base64(HMAC-SHA256(timestamp + rawBody, secretKey))
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
): boolean {
  const config = getCashfreeConfig();
  if (!config.isConfigured) {
    // In unconfigured dev sandbox, allow requests through for testing if no secret is set
    return true;
  }

  if (!signature || !timestamp) {
    return false;
  }

  try {
    const payload = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", config.secretKey)
      .update(payload)
      .digest("base64");

    const sigBuffer = Buffer.from(signature, "utf-8");
    const expBuffer = Buffer.from(expectedSignature, "utf-8");

    if (sigBuffer.length !== expBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expBuffer);
  } catch (err) {
    console.error("❌ [Cashfree] Webhook signature verification error:", err);
    return false;
  }
}
