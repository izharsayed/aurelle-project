import type { Order, OrderStatus } from "@/data/types";
import { getDb } from "../firebase";

export async function handleGetAdminOrders() {
  try {
    const db = getDb();
    const ordersColl = db.collection("orders");
    const snapshot = await ordersColl.orderBy("createdAt", "desc").get();

    const orders: Order[] = [];
    snapshot.docs.forEach((doc: any) => {
      orders.push(doc.data() as Order);
    });

    return { status: 200, body: { orders } };
  } catch (err: any) {
    console.error("❌ [Admin Orders] Failed to fetch:", err);
    return { status: 500, body: { error: err.message || "Failed to fetch orders" } };
  }
}

export async function handleUpdateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  shippingDetails?: import("@/data/types").ShippingDetails,
  env?: any,
) {
  const allowedStatuses: OrderStatus[] = [
    "PENDING_PAYMENT",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(nextStatus)) {
    return { status: 400, body: { error: `Invalid status: ${nextStatus}` } };
  }

  try {
    const db = getDb(env);
    const docRef = db.collection("orders").doc(orderId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return { status: 404, body: { error: `Order ${orderId} not found` } };
    }

    const order = snap.data() as Order;
    const updatePayload: Record<string, any> = {
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    if (shippingDetails) {
      updatePayload.shippingDetails = {
        ...shippingDetails,
        dispatchedAt: shippingDetails.dispatchedAt || new Date().toISOString(),
      };
    }

    await docRef.update(updatePayload);

    // Trigger Automated WhatsApp Notification if enabled
    try {
      const { sendWhatsAppNotification } = await import("../whatsapp-alerts");
      const updatedOrder = { ...order, ...updatePayload };
      if (nextStatus === "SHIPPED" && (shippingDetails || order.shippingDetails)) {
        await sendWhatsAppNotification(
          updatedOrder,
          {
            stage: "SHIPPED",
            shippingDetails: shippingDetails || order.shippingDetails,
          },
          env,
        );
      } else if (nextStatus === "DELIVERED") {
        await sendWhatsAppNotification(
          updatedOrder,
          {
            stage: "DELIVERED",
          },
          env,
        );
      }
    } catch {
      // Non-fatal notification failure
    }

    return {
      status: 200,
      body: {
        success: true,
        orderId,
        status: nextStatus,
        shippingDetails: updatePayload.shippingDetails,
      },
    };
  } catch (err: any) {
    console.error("❌ [Admin Orders] Status update failed:", err);
    return { status: 500, body: { error: err.message } };
  }
}
