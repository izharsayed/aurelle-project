import type { Order, PaymentRecord, PaymentStatus } from "@/data/types";
import { verifyCashfreeWebhookSignature } from "../cashfree";
import { sendOrderConfirmationEmail } from "../email";
import { getDb } from "../firebase";

export async function handleCashfreeWebhook(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
) {
  // 1. Verify Webhook Signature
  const isValid = verifyCashfreeWebhookSignature(rawBody, signature, timestamp);
  if (!isValid) {
    console.error("❌ [Webhook] Invalid Cashfree signature verification failed");
    return { status: 401, body: { error: "Invalid webhook signature" } };
  }

  let eventPayload: any;
  try {
    eventPayload = JSON.parse(rawBody);
  } catch (err) {
    console.error("❌ [Webhook] Malformed JSON payload:", err);
    return { status: 400, body: { error: "Malformed JSON payload" } };
  }

  // Cashfree standard event format:
  // type: "PAYMENT_SUCCESS_WEBHOOK" | "PAYMENT_FAILED_WEBHOOK" | "PAYMENT_USER_DROPPED_WEBHOOK"
  // data: { order: { order_id, order_amount }, payment: { cf_payment_id, payment_status, payment_amount, payment_currency, payment_method, payment_time } }
  const eventType = String(eventPayload.type || eventPayload.event || "");
  const orderData = eventPayload.data?.order || eventPayload.order || {};
  const paymentData = eventPayload.data?.payment || eventPayload.payment || {};

  const orderId = String(orderData.order_id || "");
  if (!orderId) {
    console.warn("⚠️ [Webhook] No order_id found in webhook payload");
    return { status: 200, body: { received: true, note: "Ignored, missing order_id" } };
  }

  const db = getDb();
  const orderDocRef = db.collection("orders").doc(orderId);
  const orderSnap = await orderDocRef.get();

  if (!orderSnap.exists) {
    console.error(`❌ [Webhook] Order ${orderId} not found in database`);
    return { status: 404, body: { error: `Order ${orderId} not found` } };
  }

  const existingOrder = orderSnap.data() as Order;

  // 2. Idempotency Safeguard:
  // If order is already PAID, do not re-process or re-send emails
  if (existingOrder.status === "PAID" && (eventType === "PAYMENT_SUCCESS_WEBHOOK" || paymentData.payment_status === "SUCCESS")) {
    console.log(`ℹ️ [Webhook] Order ${orderId} is already confirmed as PAID. Skipping redundant webhook.`);
    return { status: 200, body: { status: "already_processed", orderId } };
  }

  const rawPaymentStatus = String(paymentData.payment_status || "").toUpperCase();
  const cfPaymentId = String(paymentData.cf_payment_id || `pay_${Date.now()}`);

  let paymentStatus: PaymentStatus = "PENDING";
  if (rawPaymentStatus === "SUCCESS" || eventType === "PAYMENT_SUCCESS_WEBHOOK") {
    paymentStatus = "SUCCESS";
  } else if (rawPaymentStatus === "FAILED" || eventType === "PAYMENT_FAILED_WEBHOOK") {
    paymentStatus = "FAILED";
  } else if (rawPaymentStatus === "CANCELLED" || rawPaymentStatus === "USER_DROPPED") {
    paymentStatus = "CANCELLED";
  }

  // 3. Verify Amount & Currency if payment succeeded
  if (paymentStatus === "SUCCESS") {
    const paidAmount = Number(paymentData.payment_amount || orderData.order_amount || 0);
    if (Math.abs(paidAmount - existingOrder.totalAmount) > 1.0) {
      console.error(
        `🚨 [CRITICAL AMOUNT MISMATCH] Order ${orderId} expected ${existingOrder.totalAmount}, but received ${paidAmount}`,
      );
      return { status: 400, body: { error: "Payment amount does not match order total." } };
    }

    // 4. Transition Order to PAID
    const updatedOrder: Order = {
      ...existingOrder,
      status: "PAID",
      payment: {
        ...existingOrder.payment,
        status: "SUCCESS",
        gatewayPaymentId: cfPaymentId,
        method: typeof paymentData.payment_method === "object" ? JSON.stringify(paymentData.payment_method) : String(paymentData.payment_method || "UPI/Card"),
        paidAt: paymentData.payment_time || new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    await orderDocRef.update({
      status: "PAID",
      payment: updatedOrder.payment,
      updatedAt: updatedOrder.updatedAt,
    });

    // 5. Store Payment Record in payments/ collection
    const paymentRecord: PaymentRecord = {
      id: cfPaymentId,
      paymentId: cfPaymentId,
      orderId,
      amount: paidAmount,
      currency: "INR",
      gateway: "cashfree",
      status: "SUCCESS",
      method: updatedOrder.payment.method,
      bankReference: String(paymentData.bank_reference || ""),
      rawResponse: paymentData,
      createdAt: new Date().toISOString(),
    };

    await db.collection("payments").doc(cfPaymentId).set(paymentRecord);
    console.log(`✅ [Webhook] Order ${orderId} successfully updated to PAID.`);

    // 6. Send Order Confirmation Email asynchronously
    sendOrderConfirmationEmail(updatedOrder).catch((err) => {
      console.error("⚠️ [Webhook] Email error:", err);
    });

    return { status: 200, body: { status: "success", orderId } };
  } else {
    // Payment failed or cancelled
    await orderDocRef.update({
      "payment.status": paymentStatus,
      "payment.gatewayPaymentId": cfPaymentId,
      updatedAt: new Date().toISOString(),
    });

    console.log(`⚠️ [Webhook] Order ${orderId} payment failed with status: ${paymentStatus}`);
    return { status: 200, body: { status: "payment_failed", orderId } };
  }
}
