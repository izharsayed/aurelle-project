import type { Coupon, CouponValidationResult } from "@/data/types";
import { getDb } from "./firebase";

// Starter luxury coupons pre-seeded in database
export const STARTER_COUPONS: Coupon[] = [
  {
    id: "ZARIKA10",
    code: "ZARIKA10",
    description: "Launch Celebration: 10% off on all fine jewelry orders above ₹1,999 (Max ₹1,000 off)",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderValue: 1999,
    maxDiscountAmount: 1000,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ROYAL500",
    code: "ROYAL500",
    description: "Royal Privilege: ₹500 flat off on regal choker & bridal orders above ₹3,000",
    discountType: "FLAT",
    discountValue: 500,
    minOrderValue: 3000,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "WELCOME100",
    code: "WELCOME100",
    description: "Jaipur Welcome Gift: ₹100 instant off on your first jewelry order above ₹999",
    discountType: "FLAT",
    discountValue: 100,
    minOrderValue: 999,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// In-memory fallback cache
const couponCache = new Map<string, Coupon>();

// Initialize memory cache
STARTER_COUPONS.forEach((c) => couponCache.set(c.code.toUpperCase(), { ...c }));

let seedAttempted = false;

/**
 * Auto-seeds starter luxury coupons to Cloud Firestore
 */
export async function seedStarterCoupons(env?: any): Promise<void> {
  if (seedAttempted) return;
  seedAttempted = true;

  try {
    const db = getDb(env);
    const snap = await db.collection("coupons").limit(1).get();
    if (snap.empty) {
      const batch = db.batch();
      for (const coupon of STARTER_COUPONS) {
        const ref = db.collection("coupons").doc(coupon.code.toUpperCase());
        batch.set(ref, coupon);
      }
      await batch.commit();
      console.log(`[Coupons] Seeded ${STARTER_COUPONS.length} starter luxury coupons to Firestore.`);
    }
  } catch (err) {
    console.warn("[Coupons] Firestore seed skipped, running in-memory coupons:", err);
  }
}

/**
 * Retrieves all coupons for the Zarika Admin management portal
 */
export async function getAllCoupons(env?: any): Promise<Coupon[]> {
  await seedStarterCoupons(env);
  try {
    const db = getDb(env);
    const snap = await db.collection("coupons").get();
    if (!snap.empty) {
      const list: Coupon[] = [];
      snap.forEach((doc: any) => {
        const data = doc.data() as Coupon;
        list.push({ ...data, code: data.code || doc.id });
        couponCache.set(doc.id.toUpperCase(), data);
      });
      // Sort newest first
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (err) {
    console.warn("[Coupons] Error fetching from Firestore, falling back to cache:", err);
  }
  return Array.from(couponCache.values());
}

/**
 * Retrieves publicly visible active coupons for checkout suggestions
 */
export async function getActiveCoupons(env?: any): Promise<Coupon[]> {
  const all = await getAllCoupons(env);
  const now = new Date().toISOString();
  return all.filter((c) => {
    if (!c.isActive) return false;
    if (c.expiresAt && c.expiresAt < now) return false;
    if (c.usageLimit && c.usageCount >= c.usageLimit) return false;
    return true;
  });
}

/**
 * Authoritatively validates a coupon code against a subtotal amount.
 * Never trusts client price computations!
 */
export async function validateAndApplyCoupon(
  rawCode: string,
  subtotal: number,
  env?: any,
): Promise<CouponValidationResult> {
  if (!rawCode || typeof rawCode !== "string") {
    return { valid: false, message: "Please provide a coupon code.", discountAmount: 0 };
  }

  const code = rawCode.trim().toUpperCase();
  await seedStarterCoupons(env);

  let coupon: Coupon | undefined = couponCache.get(code);

  try {
    const db = getDb(env);
    const doc = await db.collection("coupons").doc(code).get();
    if (doc.exists) {
      coupon = doc.data() as Coupon;
      couponCache.set(code, coupon);
    }
  } catch {
    // Fall back to coupon in cache
  }

  if (!coupon) {
    return {
      valid: false,
      message: `Coupon code "${code}" is not valid. Please check for typos.`,
      discountAmount: 0,
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      message: `Coupon code "${code}" is currently inactive or paused.`,
      discountAmount: 0,
    };
  }

  const now = new Date().toISOString();
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return {
      valid: false,
      message: `Coupon code "${code}" has expired.`,
      discountAmount: 0,
    };
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return {
      valid: false,
      message: `Coupon code "${code}" has reached its maximum redemptions limit.`,
      discountAmount: 0,
    };
  }

  if (subtotal < coupon.minOrderValue) {
    const diff = coupon.minOrderValue - subtotal;
    return {
      valid: false,
      message: `Add ₹${diff.toLocaleString("en-IN")} more to your bag to use "${code}" (Minimum order: ₹${coupon.minOrderValue.toLocaleString("en-IN")}).`,
      discountAmount: 0,
      minOrderValue: coupon.minOrderValue,
    };
  }

  // Calculate authoritative discount
  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    const rawDiscount = Math.round(subtotal * (coupon.discountValue / 100));
    if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
      discountAmount = Math.min(rawDiscount, coupon.maxDiscountAmount);
    } else {
      discountAmount = rawDiscount;
    }
  } else {
    // Flat Rupee discount
    discountAmount = Math.min(coupon.discountValue, subtotal);
  }

  return {
    valid: true,
    message: `✨ Coupon "${code}" applied successfully! You saved ₹${discountAmount.toLocaleString("en-IN")}.`,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    minOrderValue: coupon.minOrderValue,
    maxDiscountAmount: coupon.maxDiscountAmount,
  };
}

/**
 * Creates or updates a coupon (Admin)
 */
export async function saveCoupon(
  couponInput: Partial<Coupon> & { code: string },
  env?: any,
): Promise<{ success: boolean; coupon?: Coupon; error?: string }> {
  const code = couponInput.code.trim().toUpperCase();
  if (!code || code.length < 3) {
    return { success: false, error: "Coupon code must be at least 3 characters." };
  }

  const discountValue = Number(couponInput.discountValue);
  if (isNaN(discountValue) || discountValue <= 0) {
    return { success: false, error: "Discount value must be greater than 0." };
  }

  const minOrderValue = Math.max(0, Number(couponInput.minOrderValue) || 0);
  const maxDiscountAmount = couponInput.maxDiscountAmount
    ? Number(couponInput.maxDiscountAmount)
    : undefined;

  const now = new Date().toISOString();
  const existing = couponCache.get(code);

  const coupon: Coupon = {
    id: code,
    code,
    description: couponInput.description?.trim() || `Luxury discount: ${code}`,
    discountType: couponInput.discountType === "PERCENTAGE" ? "PERCENTAGE" : "FLAT",
    discountValue,
    minOrderValue,
    maxDiscountAmount: maxDiscountAmount && maxDiscountAmount > 0 ? maxDiscountAmount : undefined,
    isActive: couponInput.isActive ?? true,
    usageCount: existing?.usageCount || 0,
    usageLimit: couponInput.usageLimit ? Number(couponInput.usageLimit) : undefined,
    expiresAt: couponInput.expiresAt ? couponInput.expiresAt : undefined,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  couponCache.set(code, coupon);

  try {
    const db = getDb(env);
    await db.collection("coupons").doc(code).set(coupon, { merge: true });
  } catch (err) {
    console.warn("[Coupons] Firestore save error:", err);
  }

  return { success: true, coupon };
}

/**
 * Toggles a coupon's active status (Admin)
 */
export async function toggleCouponStatus(
  code: string,
  isActive: boolean,
  env?: any,
): Promise<{ success: boolean }> {
  const upperCode = code.trim().toUpperCase();
  const existing = couponCache.get(upperCode);
  if (existing) {
    existing.isActive = isActive;
    existing.updatedAt = new Date().toISOString();
    couponCache.set(upperCode, existing);
  }

  try {
    const db = getDb(env);
    await db.collection("coupons").doc(upperCode).update({
      isActive,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[Coupons] Firestore toggle error:", err);
  }

  return { success: true };
}

/**
 * Deletes a coupon (Admin)
 */
export async function deleteCoupon(code: string, env?: any): Promise<{ success: boolean }> {
  const upperCode = code.trim().toUpperCase();
  couponCache.delete(upperCode);

  try {
    const db = getDb(env);
    await db.collection("coupons").doc(upperCode).delete();
  } catch (err) {
    console.warn("[Coupons] Firestore delete error:", err);
  }

  return { success: true };
}

/**
 * Increments coupon usage count when an order is successfully placed or paid
 */
export async function incrementCouponUsage(code: string, env?: any): Promise<void> {
  const upperCode = code.trim().toUpperCase();
  const existing = couponCache.get(upperCode);
  if (existing) {
    existing.usageCount = (existing.usageCount || 0) + 1;
    existing.updatedAt = new Date().toISOString();
  }

  try {
    const db = getDb(env);
    const ref = db.collection("coupons").doc(upperCode);
    const doc = await ref.get();
    if (doc.exists) {
      const current = doc.data()?.usageCount || 0;
      await ref.update({
        usageCount: current + 1,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn("[Coupons] Failed to increment usage count:", err);
  }
}
