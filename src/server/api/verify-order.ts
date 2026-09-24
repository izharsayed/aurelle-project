import type { Order } from "@/data/types";
import { getCashfreeOrder, getCashfreePayments } from "../cashfree";
import { getDb } from "../firebase";

export async function handleVerifyOrder(orderId: string) {
  if (!orderId || typeof orderId !== "string") {
    return { status: 400, body: { error: "orderId is required" } };
  }

  const db = getDb();
  const orderDocRef = db.collection("orders").doc(orderId);
  const orderSnap = await orderDocRef.get();

  if (!orderSnap.exists) {
    return { status: 404, body: { error: `Order ${orderId} not found` } };
  }

  const order = orderSnap.data() as Order;

  // If already confirmed as PAID, return verified details
  if (order.status === "PAID" || order.payment.status === "SUCCESS") {
    return {
      status: 200,
      body: {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.payment.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
        customerName: order.customer.fullName,
        customerEmail: order.customer.email,
        items: order.items,
        subtotal: order.subtotal,
        shippingAmount: order.shippingAmount,
        address: order.customer,
        createdAt: order.createdAt,
      },
    };
  }

  // If still PENDING_PAYMENT, poll Cashfree API directly for live status check
  try {
    const cfOrder = await getCashfreeOrder(orderId);
    if (cfOrder && (cfOrder["order_status"] === "PAID" || cfOrder["order_status"] === "SUCCESS")) {
      const payments = await getCashfreePayments(orderId);
      const successfulPayment = payments.find((p) => p.payment_status === "SUCCESS") || payments[0];

      // Update Firestore
      await orderDocRef.update({
        status: "PAID",
        "payment.status": "SUCCESS",
        "payment.gatewayPaymentId": successfulPayment?.cf_payment_id || order.payment.gatewayPaymentId,
        "payment.paidAt": successfulPayment?.payment_time || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        status: 200,
        body: {
          orderId: order.orderId,
          status: "PAID",
          paymentStatus: "SUCCESS",
          totalAmount: order.totalAmount,
          currency: order.currency,
          customerName: order.customer.fullName,
          customerEmail: order.customer.email,
          items: order.items,
          subtotal: order.subtotal,
          shippingAmount: order.shippingAmount,
          address: order.customer,
          createdAt: order.createdAt,
        },
      };
    }
  } catch (err) {
    console.warn("⚠️ [Verify] Cashfree status check error:", err);
  }

  // Still pending or awaiting completion
  return {
    status: 200,
    body: {
      orderId: order.orderId,
      status: order.status,
      paymentStatus: order.payment.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
      customerName: order.customer.fullName,
      customerEmail: order.customer.email,
      items: order.items,
      subtotal: order.subtotal,
      shippingAmount: order.shippingAmount,
      address: order.customer,
      createdAt: order.createdAt,
    },
  };
}
