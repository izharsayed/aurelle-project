import { products as seedProducts } from "@/data/products";
import type { Product } from "@/data/types";
import { getDb } from "../firebase";

/**
 * GET /api/catalog/products
 * Fetches all authoritative products from Cloud Firestore
 */
export async function handleGetCatalogProducts(): Promise<{
  status: number;
  body: Record<string, any>;
}> {
  try {
    const db = getDb();
    const productsColl = db.collection("products");
    const snapshot = await productsColl.get();

    if (!snapshot.empty && Array.isArray(snapshot.docs) && snapshot.docs.length > 0) {
      const dbProducts = snapshot.docs.map((doc: any) => doc.data() as Product);
      return { status: 200, body: { products: dbProducts } };
    }
  } catch (err) {
    console.warn("⚠️ [Catalog API] Firestore read failed, falling back to seed products:", err);
  }

  return { status: 200, body: { products: seedProducts } };
}

/**
 * POST /api/catalog/products
 * Saves or updates a product in live Cloud Firestore
 */
export async function handleSaveCatalogProduct(
  productData: Partial<Product>,
): Promise<{ status: number; body: Record<string, any> }> {
  if (!productData || !productData.id || !productData.name) {
    return { status: 400, body: { error: "Product ID and Name are required" } };
  }

  try {
    const db = getDb();
    const docRef = db.collection("products").doc(productData.id);
    await docRef.set(productData, { merge: true });

    console.log(
      `✅ [Catalog API] Product "${productData.name}" (${productData.id}) saved to Firestore.`,
    );
    return { status: 200, body: { success: true, product: productData } };
  } catch (err: any) {
    console.error("❌ [Catalog API] Failed to save product to Firestore:", err);
    return { status: 500, body: { error: err.message || "Failed to save product to Firestore" } };
  }
}

/**
 * DELETE /api/catalog/products
 * Deletes a product from live Cloud Firestore
 */
export async function handleDeleteCatalogProduct(
  productId: string,
): Promise<{ status: number; body: Record<string, any> }> {
  if (!productId) {
    return { status: 400, body: { error: "Product ID is required" } };
  }

  try {
    const db = getDb();
    const docRef = db.collection("products").doc(productId);
    await docRef.delete();

    console.log(`✅ [Catalog API] Product ${productId} deleted from Firestore.`);
    return { status: 200, body: { success: true, deletedId: productId } };
  } catch (err: any) {
    console.error(`❌ [Catalog API] Failed to delete product ${productId}:`, err);
    return { status: 500, body: { error: err.message || "Failed to delete product" } };
  }
}
