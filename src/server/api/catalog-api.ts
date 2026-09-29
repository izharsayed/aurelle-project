import { products as seedProducts } from "@/data/products";
import type { Product } from "@/data/types";
import { getDb } from "../firebase";

function getSupabaseConfig(env?: any) {
  const url = (
    env?.SUPABASE_URL ||
    process.env["SUPABASE_URL"] ||
    ""
  ).replace(/\/+$/, "");

  const key =
    env?.SUPABASE_KEY ||
    process.env["SUPABASE_KEY"] ||
    env?.SUPABASE_SERVICE_ROLE_KEY ||
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    env?.SUPABASE_ANON_KEY ||
    process.env["SUPABASE_ANON_KEY"] ||
    "";

  const bucket =
    env?.SUPABASE_BUCKET ||
    process.env["SUPABASE_BUCKET"] ||
    "products";

  return { url, key, bucket };
}

/**
 * GET /api/catalog/products
 * Fetches all authoritative products from Supabase Storage (primary cloud sync)
 * or Cloud Firestore, falling back to seed products.
 */
export async function handleGetCatalogProducts(env?: any): Promise<{
  status: number;
  body: Record<string, any>;
}> {
  const { url, key, bucket } = getSupabaseConfig(env);

  // 1. Try Supabase Storage (catalog.json)
  if (url) {
    try {
      const catalogUrl = `${url}/storage/v1/object/public/${bucket}/catalog.json?t=${Date.now()}`;
      const res = await fetch(catalogUrl, {
        headers: key ? { Authorization: `Bearer ${key}`, apikey: key } : {},
      });

      if (res.ok) {
        const cloudProducts = (await res.json()) as Product[];
        if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
          return { status: 200, body: { products: cloudProducts } };
        }
      }
    } catch (err) {
      console.warn("⚠️ [Catalog API] Supabase catalog read error:", err);
    }
  }

  // 2. Try Cloud Firestore
  try {
    const db = getDb(env);
    const productsColl = db.collection("products");
    const snapshot = await productsColl.get();

    if (!snapshot.empty && Array.isArray(snapshot.docs) && snapshot.docs.length > 0) {
      const dbProducts = snapshot.docs.map((doc: any) => doc.data() as Product);
      return { status: 200, body: { products: dbProducts } };
    }
  } catch (err) {
    console.warn("⚠️ [Catalog API] Firestore read failed, falling back to seed products:", err);
  }

  // 3. Fallback to bundled seed products
  return { status: 200, body: { products: seedProducts } };
}

/**
 * POST /api/catalog/products
 * Saves or updates a product in Supabase Storage AND live Cloud Firestore
 */
export async function handleSaveCatalogProduct(
  productData: Partial<Product>,
  env?: any,
): Promise<{ status: number; body: Record<string, any> }> {
  if (!productData || !productData.id || !productData.name) {
    return { status: 400, body: { error: "Product ID and Name are required" } };
  }

  const { url, key, bucket } = getSupabaseConfig(env);

  // Get current catalog
  const currentCatalogRes = await handleGetCatalogProducts(env);
  const currentProducts: Product[] = currentCatalogRes.body.products || [...seedProducts];

  // Update or insert product
  const existingIdx = currentProducts.findIndex((p) => p.id === productData.id);
  let updatedCatalog: Product[];

  if (existingIdx >= 0) {
    updatedCatalog = [...currentProducts];
    updatedCatalog[existingIdx] = { ...updatedCatalog[existingIdx]!, ...productData } as Product;
  } else {
    updatedCatalog = [productData as Product, ...currentProducts];
  }

  // 1. Save to Supabase Storage
  if (url && key) {
    try {
      const uploadUrl = `${url}/storage/v1/object/${bucket}/catalog.json`;
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          apikey: key,
          "Content-Type": "application/json",
          "x-upsert": "true",
        },
        body: JSON.stringify(updatedCatalog),
      });

      if (!res.ok) {
        console.warn(`⚠️ [Catalog API] Supabase catalog write warning: ${await res.text()}`);
      } else {
        console.log(`✅ [Catalog API] Updated catalog.json on Supabase Storage (${updatedCatalog.length} items).`);
      }
    } catch (err) {
      console.error("❌ [Catalog API] Supabase catalog write failed:", err);
    }
  }

  // 2. Also save to Cloud Firestore if configured
  try {
    const db = getDb(env);
    const docRef = db.collection("products").doc(productData.id);
    await docRef.set(productData, { merge: true });
    console.log(`✅ [Catalog API] Product "${productData.name}" (${productData.id}) saved to Firestore.`);
  } catch (err: any) {
    console.warn("ℹ️ [Catalog API] Firestore sync skipped or failed:", err?.message || err);
  }

  return { status: 200, body: { success: true, product: productData } };
}

/**
 * DELETE /api/catalog/products
 * Deletes a product from Supabase Storage AND live Cloud Firestore
 */
export async function handleDeleteCatalogProduct(
  productId: string,
  env?: any,
): Promise<{ status: number; body: Record<string, any> }> {
  if (!productId) {
    return { status: 400, body: { error: "Product ID is required" } };
  }

  const { url, key, bucket } = getSupabaseConfig(env);

  // Get current catalog
  const currentCatalogRes = await handleGetCatalogProducts(env);
  const currentProducts: Product[] = currentCatalogRes.body.products || [...seedProducts];
  const updatedCatalog = currentProducts.filter((p) => p.id !== productId);

  // 1. Save updated list to Supabase Storage
  if (url && key) {
    try {
      const uploadUrl = `${url}/storage/v1/object/${bucket}/catalog.json`;
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          apikey: key,
          "Content-Type": "application/json",
          "x-upsert": "true",
        },
        body: JSON.stringify(updatedCatalog),
      });

      if (!res.ok) {
        console.warn(`⚠️ [Catalog API] Supabase catalog delete write warning: ${await res.text()}`);
      } else {
        console.log(`✅ [Catalog API] Deleted ${productId} from Supabase catalog.json.`);
      }
    } catch (err) {
      console.error("❌ [Catalog API] Supabase catalog write failed:", err);
    }
  }

  // 2. Also delete from Firestore if configured
  try {
    const db = getDb(env);
    const docRef = db.collection("products").doc(productId);
    await docRef.delete();
    console.log(`✅ [Catalog API] Product ${productId} deleted from Firestore.`);
  } catch (err: any) {
    console.warn("ℹ️ [Catalog API] Firestore delete skipped or failed:", err?.message || err);
  }

  return { status: 200, body: { success: true, deletedId: productId } };
}
