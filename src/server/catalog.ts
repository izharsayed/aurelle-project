import { products as seedProducts } from "@/data/products";
import type { OrderItem, Product } from "@/data/types";
import { getDb } from "./firebase";

export const SHIPPING_THRESHOLD = 2500; // Complimentary shipping above ₹2,500
export const STANDARD_SHIPPING_FEE = 150;

/**
 * In-memory map of seed products for rapid authoritative lookup
 */
const seedProductMap = new Map<string, Product>(
  seedProducts.map((p) => [p.id, p]),
);

/**
 * Retrieves an authoritative product either from Firestore or seed catalog
 */
export async function getAuthoritativeProduct(productId: string): Promise<Product | null> {
  try {
    const db = getDb();
    const docRef = db.collection("products").doc(productId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data() as Product;
    }
  } catch (err) {
    console.warn("⚠️ [Catalog] Firestore product read fallback to seed:", err);
  }

  // Fallback to local verified seed catalog
  return seedProductMap.get(productId) || null;
}

export interface ClientCartItemInput {
  productId: string;
  quantity: number;
  color?: string;
}

export interface VerifiedCartCalculation {
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
}

/**
 * AUTHORITATIVE PRICING ENGINE:
 * Never trusts prices or totals sent by the browser.
 * Validates each item against Firestore / verified seed catalog,
 * computes item subtotal, cart subtotal, shipping fee, and final grand total.
 */
export async function verifyCartAndCalculateTotals(
  clientItems: ClientCartItemInput[],
): Promise<VerifiedCartCalculation> {
  if (!Array.isArray(clientItems) || clientItems.length === 0) {
    throw new Error("Shopping cart is empty.");
  }

  const verifiedItems: OrderItem[] = [];
  let subtotal = 0;

  for (const item of clientItems) {
    const qty = Math.floor(Number(item.quantity));
    if (!qty || qty <= 0) {
      throw new Error(`Invalid quantity for product ${item.productId}`);
    }

    if (qty > 10) {
      throw new Error(`Maximum 10 units allowed per item for luxury safety`);
    }

    const authoritativeProduct = await getAuthoritativeProduct(item.productId);
    if (!authoritativeProduct) {
      throw new Error(`Product "${item.productId}" is not recognized in catalog.`);
    }

    if (!authoritativeProduct.inStock) {
      throw new Error(`"${authoritativeProduct.name}" is currently out of stock.`);
    }

    // Use authoritative price: salePrice if valid, else standard price
    const unitPrice =
      typeof authoritativeProduct.salePrice === "number" && authoritativeProduct.salePrice > 0
        ? authoritativeProduct.salePrice
        : authoritativeProduct.price;

    const itemSubtotal = unitPrice * qty;
    subtotal += itemSubtotal;

    verifiedItems.push({
      productId: authoritativeProduct.id,
      name: authoritativeProduct.name,
      sku: authoritativeProduct.sku,
      quantity: qty,
      price: unitPrice,
      subtotal: itemSubtotal,
      color: item.color || authoritativeProduct.colors[0]?.name || "Gold",
      image: authoritativeProduct.images[0] || "",
    });
  }

  // Calculate luxury shipping rule
  const shippingAmount = subtotal >= SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const totalAmount = subtotal + shippingAmount;

  return {
    items: verifiedItems,
    subtotal,
    shippingAmount,
    totalAmount,
  };
}

/**
 * Seeds Firestore with the initial product catalog if empty
 */
export async function seedAuthoritativeCatalog(): Promise<number> {
  try {
    const db = getDb();
    const productsColl = db.collection("products");
    const snapshot = await productsColl.get();

    if (!snapshot.empty) {
      return 0; // Already seeded
    }

    let seededCount = 0;
    for (const prod of seedProducts) {
      await productsColl.doc(prod.id).set(prod);
      seededCount++;
    }

    console.log(`✅ [Catalog] Seeded ${seededCount} authoritative products to Firestore.`);
    return seededCount;
  } catch (err) {
    console.error("❌ [Catalog] Seeding failed:", err);
    return 0;
  }
}
