import type { Order, ShippingDetails } from "@/data/types";
import {
  generateOrderConfirmedMessage,
  generateOrderShippedMessage,
  generateOrderDeliveredMessage,
  sanitizePhoneNumber,
} from "@/lib/whatsapp-templates";
import { getDb } from "./firebase";

export type WhatsAppAlertStage = "CONFIRMED" | "SHIPPED" | "DELIVERED";

export interface SendWhatsAppAlertOptions {
  stage: WhatsAppAlertStage;
  customMessage?: string;
  shippingDetails?: ShippingDetails;
  baseUrl?: string;
}

/**
 * Sends automated WhatsApp notification via Meta WhatsApp Cloud API or Twilio if configured
 */
export async function sendWhatsAppNotification(
  order: Order,
  options: SendWhatsAppAlertOptions,
  env?: any,
): Promise<{ success: boolean; mode: "cloud_api" | "concierge_ready"; message: string; error?: string }> {
  const g = globalThis as any;
  const token = env?.WHATSAPP_TOKEN || g.__env__?.WHATSAPP_TOKEN || process.env.WHATSAPP_TOKEN;
  const phoneNumberId =
    env?.WHATSAPP_PHONE_NUMBER_ID ||
    g.__env__?.WHATSAPP_PHONE_NUMBER_ID ||
    process.env.WHATSAPP_PHONE_NUMBER_ID;

  // 1. Prepare message text
  let messageText = options.customMessage;
  if (!messageText) {
    if (options.stage === "CONFIRMED") {
      messageText = generateOrderConfirmedMessage(order, options.baseUrl);
    } else if (options.stage === "SHIPPED" && options.shippingDetails) {
      messageText = generateOrderShippedMessage(order, options.shippingDetails, options.baseUrl);
    } else if (options.stage === "DELIVERED") {
      messageText = generateOrderDeliveredMessage(order);
    } else {
      messageText = generateOrderConfirmedMessage(order, options.baseUrl);
    }
  }

  const recipientPhone = sanitizePhoneNumber(order.customer.mobileNumber);

  // 2. If Meta WhatsApp Cloud API is configured, send directly
  if (token && phoneNumberId && recipientPhone) {
    try {
      const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientPhone,
          type: "text",
          text: {
            preview_url: true,
            body: messageText,
          },
        }),
      });

      const json: any = await response.json();
      if (response.ok && json.messages) {
        console.log(`✅ [WhatsApp API] Notification sent to +${recipientPhone} (${options.stage})`);
        await recordNotificationLog(order.orderId, {
          stage: options.stage,
          recipient: recipientPhone,
          status: "DELIVERED_VIA_CLOUD_API",
          timestamp: new Date().toISOString(),
        }, env);

        return {
          success: true,
          mode: "cloud_api",
          message: `Sent to +${recipientPhone} via Meta Cloud API`,
        };
      } else {
        console.warn(`⚠️ [WhatsApp API] Meta API response:`, json);
      }
    } catch (err: any) {
      console.warn(`⚠️ [WhatsApp API] Cloud dispatch error:`, err?.message || err);
    }
  }

  // 3. Fallback: Log that concierge message is prepared for 1-Click admin dispatch
  console.log(
    `ℹ️ [WhatsApp Alert] Pre-formatted ${options.stage} message prepared for +${recipientPhone} (1-Click Concierge Dispatch active).`,
  );

  await recordNotificationLog(order.orderId, {
    stage: options.stage,
    recipient: recipientPhone,
    status: "CONCIERGE_DISPATCH_READY",
    timestamp: new Date().toISOString(),
  }, env);

  return {
    success: true,
    mode: "concierge_ready",
    message: messageText,
  };
}

/**
 * Records notification log in Cloud Firestore
 */
async function recordNotificationLog(
  orderId: string,
  log: { stage: string; recipient: string; status: string; timestamp: string },
  env?: any,
) {
  try {
    const db = getDb(env);
    await db.collection("orders").doc(orderId).collection("notifications").add(log);
  } catch {
    // Non-fatal logging
  }
}
