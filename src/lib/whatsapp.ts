import type { Product } from "@/data/types";
import { formatPrice } from "./format";

/**
 * Default Velora WhatsApp Concierge phone number (with country code).
 * Can be updated anytime by the store manager in /admin Settings.
 */
export const DEFAULT_WHATSAPP_NUMBER = "919876543210";
export const WHATSAPP_NUMBER: string | null = DEFAULT_WHATSAPP_NUMBER;

export interface OrderIntent {
  product: Product;
  color?: string | undefined;
  quantity?: number | undefined;
}

export const buildOrderMessage = ({ product, color, quantity = 1 }: OrderIntent) => {
  const price = product.salePrice ?? product.price;
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";

  return [
    "✨ *Order Inquiry — Velora Fine Jewelry*",
    "",
    `💎 *Product:* ${product.name}`,
    `🏷️ *SKU:* ${product.sku}`,
    color ? `🎨 *Finish:* ${color}` : null,
    `📦 *Quantity:* ${quantity}`,
    `💰 *Price:* ${formatPrice(price)}`,
    siteOrigin ? `🔗 *Link:* ${siteOrigin}/product/${product.slug}` : null,
    "",
    "Could you please confirm availability and delivery time?",
  ]
    .filter(Boolean)
    .join("\n");
};

export const buildWhatsAppUrl = (message: string, customNumber?: string | null) => {
  const rawNum = customNumber?.trim() || WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;
  const cleanNumber = rawNum ? rawNum.replace(/[^0-9]/g, "") : "";

  if (cleanNumber) {
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
};
