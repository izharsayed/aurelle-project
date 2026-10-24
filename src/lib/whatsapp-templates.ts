import type { Order, ShippingDetails } from "@/data/types";
import { formatPrice } from "@/lib/format";

/**
 * Sanitizes phone numbers to standard international format without '+' or spaces.
 * Defaults to Indian country code 91 if 10-digit number is provided.
 */
export function sanitizePhoneNumber(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

/**
 * Generates an instant direct wa.me link that opens WhatsApp Web or the WhatsApp mobile app
 */
export function getWhatsAppDirectUrl(phone: string, message: string): string {
  const cleanPhone = sanitizePhoneNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates tracking URL for common Indian courier services
 */
export function getCourierTrackingUrl(courierName: string, trackingNumber: string): string {
  const name = (courierName || "").toLowerCase().trim();
  const awb = encodeURIComponent(trackingNumber.trim());

  if (name.includes("delhivery")) {
    return `https://www.delhivery.com/track/package/${awb}`;
  }
  if (name.includes("bluedart") || name.includes("blue dart")) {
    return `https://www.bluedart.com/tracking?handler=tnt&action=custtrack&awb=awb&numbers=${awb}`;
  }
  if (name.includes("dtdc")) {
    return `https://www.dtdc.in/tracking/tracking_results.asp?trkid=${awb}`;
  }
  if (name.includes("shiprocket")) {
    return `https://shiprocket.co/tracking/${awb}`;
  }
  if (name.includes("india post") || name.includes("speed post")) {
    return `https://www.indiapost.gov.in/_layouts/15/dpt.cpt.etracking/trackconsignment.aspx`;
  }
  if (name.includes("ecom express")) {
    return `https://ecomexpress.in/tracking/?awb_field=${awb}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`${courierName} tracking ${trackingNumber}`)}`;
}

/**
 * STAGE 1: Order Confirmed & Payment Received Template
 */
export function generateOrderConfirmedMessage(order: Order, baseUrl?: string): string {
  const appUrl = baseUrl || "https://aurelle-project.izharsayed31.workers.dev";
  const trackingPageUrl = `${appUrl}/order/${order.orderId}`;

  const itemsList = order.items
    .map(
      (item, i) =>
        `  ${i + 1}. *${item.name}* (Qty: ${item.quantity}${item.color ? `, ${item.color}` : ""}) - ${formatPrice(item.subtotal)}`,
    )
    .join("\n");

  const voucherText =
    order.discountAmount && order.discountAmount > 0
      ? `\n✨ *Luxury Voucher (${order.couponCode || "PROMO"}):* -${formatPrice(order.discountAmount)}`
      : "";

  return (
`✨ *ZARIKA FINE JEWELRY* ✨
_Jaipur Heritage • Handcrafted Heirlooms_
━━━━━━━━━━━━━━━━━━━━
Namaste *${order.customer.fullName}*,

Thank you for choosing Zarika. We are honored to confirm that your order *#${order.orderId}* has been successfully placed and payment is verified!

📦 *YOUR SELECTED PIECES:*
${itemsList}

💰 *PAYMENT SUMMARY:*
• Subtotal: ${formatPrice(order.subtotal)}${voucherText}
• Insured Express Shipping: ${order.shippingAmount === 0 ? "Complimentary (FREE)" : formatPrice(order.shippingAmount)}
• Luxury Box Packaging: Included
• *Total Paid:* *${formatPrice(order.totalAmount)}*

📍 *DELIVERY DESTINATION:*
${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}

🔍 *LIVE ORDER TRACKING:*
You can track your order status anytime here:
${trackingPageUrl}

Our master artisans in Jaipur are carefully inspecting and packing your jewelry in our signature suede gift box. We will notify you with the courier tracking number the moment your parcel leaves our atelier.

With warmth,
*Zarika Concierge Team*
WhatsApp: +91 98765 43210
www.zarikajewelry.com`
  );
}

/**
 * STAGE 2: Order Dispatched / Shipped Template
 */
export function generateOrderShippedMessage(
  order: Order,
  shipping: ShippingDetails,
  baseUrl?: string,
): string {
  const trackingUrl =
    shipping.trackingUrl || getCourierTrackingUrl(shipping.courierName, shipping.trackingNumber);

  return (
`🚚 *DISPATCH ALERT — ZARIKA FINE JEWELRY*
━━━━━━━━━━━━━━━━━━━━
Dear *${order.customer.fullName}*,

Splendid news! Your handcrafted jewelry order *#${order.orderId}* has been safely packed in our luxury tamper-proof seal and handed over to our insured courier partner.

📦 *COURIER & TRACKING DETAILS:*
• Courier Partner: *${shipping.courierName}*
• AWB / Tracking No: *${shipping.trackingNumber}*
${shipping.estimatedDelivery ? `• Expected Delivery: *${shipping.estimatedDelivery}*\n` : ""}\
🔗 *TRACK YOUR PARCEL:*
${trackingUrl}

💎 *PARCEL CONTENTS:*
${order.items.map((it) => `• ${it.name} (x${it.quantity})`).join("\n")}

📍 *DELIVERING TO:*
${order.customer.address}, ${order.customer.city}

_Note: For security, please inspect the outer Zarika tamper-evident seal before accepting the delivery._

Should you require any concierge assistance, reply to this message anytime!

Warm regards,
*Zarika Atelier Dispatch, Jaipur*`
  );
}

/**
 * STAGE 3: Order Delivered & Care Instructions Template
 */
export function generateOrderDeliveredMessage(order: Order): string {
  return (
`✨ *HEIRLOOM DELIVERED — ZARIKA FINE JEWELRY*
━━━━━━━━━━━━━━━━━━━━
Dear *${order.customer.fullName}*,

Our delivery records show that your order *#${order.orderId}* has arrived safely at your destination!

We hope you cherish wearing your new piece as much as our artisans loved shaping it for you.

👑 *ARTISAN CARE GUIDE:*
To keep your 18K micro-plated jewelry radiant for generations:
1. Avoid contact with perfumes, hairsprays, and lotions.
2. Remove before bathing, swimming, or rigorous workouts.
3. Gently wipe with a soft dry cotton cloth after wearing.
4. Store separately in the provided Zarika suede pouch.

🌟 *YOUR FEEDBACK MEANS THE WORLD:*
We would love to know how you liked your piece! Feel free to reply with a photo wearing your Zarika jewelry or share your review with our design team.

Thank you for being part of the Zarika family!

Warmest regards,
*Zarika Fine Jewelry, Jaipur*`
  );
}
