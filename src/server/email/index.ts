import type { Order } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { getDb } from "../firebase";

/**
 * Builds a luxury branded HTML email template for Velora Fine Jewelry
 */
export function buildOrderConfirmationEmailHtml(order: Order): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e8e3d9; font-family: 'Jost', sans-serif;">
        <strong style="color: #1a1a1a; font-size: 14px;">${item.name}</strong><br/>
        <span style="font-size: 12px; color: #737373;">SKU: ${item.sku} ${item.color ? `• Finish: ${item.color}` : ""}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e8e3d9; text-align: center; font-size: 13px; color: #525252;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e8e3d9; text-align: right; font-size: 14px; font-weight: 500; color: #1a1a1a;">
        ${formatPrice(item.subtotal)}
      </td>
    </tr>
  `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Velora Fine Jewelry Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fbf9f5; font-family: 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a;">
  <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border: 1px solid #e8e3d9; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
    
    <!-- Brand Header -->
    <div style="background: #111111; padding: 32px 20px; text-align: center; border-bottom: 2px solid #c9a84c;">
      <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; letter-spacing: 0.25em; text-transform: uppercase; color: #ffffff; font-weight: 300;">
        V E L O R A
      </h1>
      <p style="margin: 6px 0 0; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #c9a84c;">
        Fine Jewelry • Jaipur
      </p>
    </div>

    <!-- Hero Confirmation -->
    <div style="padding: 36px 32px 24px; text-align: center;">
      <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: #fdfbf7; border: 1px solid #c9a84c; color: #c9a84c; font-size: 20px; margin-bottom: 16px;">
        ✓
      </div>
      <h2 style="margin: 0 0 8px; font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: normal; color: #111111;">
        Thank you for your order, ${order.customer.fullName}
      </h2>
      <p style="margin: 0; font-size: 14px; color: #525252; line-height: 1.6;">
        We have received your payment via Cashfree and our master artisans are preparing your heirloom piece.
      </p>
    </div>

    <!-- Order Metadata Box -->
    <div style="margin: 0 32px 24px; padding: 18px 20px; background: #faf8f5; border: 1px solid #ede8de; border-radius: 4px; display: flex; justify-content: space-between; font-size: 13px;">
      <div>
        <span style="color: #737373; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; display: block;">Order Number</span>
        <strong style="font-family: monospace; font-size: 14px; color: #111111;">${order.orderId}</strong>
      </div>
      <div style="text-align: right;">
        <span style="color: #737373; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; display: block;">Order Date</span>
        <strong style="color: #111111;">${new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</strong>
      </div>
    </div>

    <!-- Items Table -->
    <div style="padding: 0 32px 24px;">
      <h3 style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #737373;">
        Pieces in Your Order
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid #d4cdbf; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #737373;">
            <th style="padding-bottom: 8px; text-align: left; font-weight: 500;">Piece</th>
            <th style="padding-bottom: 8px; text-align: center; font-weight: 500;">Qty</th>
            <th style="padding-bottom: 8px; text-align: right; font-weight: 500;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals Breakdown -->
      <div style="margin-top: 20px; border-top: 1px solid #e8e3d9; padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #525252;">
          <span>Subtotal</span>
          <span>${formatPrice(order.subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #525252;">
          <span>Shipping & Luxury Packaging</span>
          <span>${order.shippingAmount === 0 ? "Complimentary" : formatPrice(order.shippingAmount)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px dashed #d4cdbf; font-size: 16px; font-weight: 600; color: #111111;">
          <span>Total Paid</span>
          <span style="color: #9d7826;">${formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>

    <!-- Delivery Address -->
    <div style="margin: 0 32px 32px; padding: 20px; background: #faf8f5; border: 1px solid #ede8de; border-radius: 4px;">
      <h3 style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #737373;">
        Delivery Destination
      </h3>
      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #333333;">
        <strong>${order.customer.fullName}</strong><br/>
        ${order.customer.address}<br/>
        ${order.customer.city}, ${order.customer.state} — ${order.customer.pincode}<br/>
        Mobile: ${order.customer.mobileNumber}
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f4f0e8; padding: 24px; text-align: center; font-size: 12px; color: #737373; border-top: 1px solid #e8e3d9;">
      <p style="margin: 0 0 6px;">
        Need concierge assistance with this order? Reply directly to this email or message our WhatsApp team.
      </p>
      <p style="margin: 0; font-size: 11px; color: #999999;">
        © ${new Date().getFullYear()} Velora Fine Jewelry. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Sends order confirmation email.
 * Preferred ecosystem: Firebase "Trigger Email from Firestore" extension pattern
 * (writes to `mail/` collection) or SMTP fallback if configured.
 * Safely catches and logs errors without failing the order.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const html = buildOrderConfirmationEmailHtml(order);

  try {
    const db = getDb();
    const mailCollection = db.collection("mail");

    // Standard Firebase Trigger Email document structure
    await mailCollection.add({
      to: [order.customer.email],
      message: {
        subject: `Order Confirmed: ${order.orderId} • Velora Fine Jewelry`,
        text: `Thank you for your order #${order.orderId}, ${order.customer.fullName}. Your payment of ${formatPrice(order.totalAmount)} was received.`,
        html,
      },
      orderId: order.orderId,
      createdAt: new Date().toISOString(),
    });

    console.log(`✉️ [Email] Queued confirmation email in Firestore 'mail' collection for ${order.customer.email}`);
    return true;
  } catch (err) {
    console.warn("⚠️ [Email] Could not queue email via Firestore 'mail' collection:", err);
    return false;
  }
}
