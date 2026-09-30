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

  const bucket = env?.SUPABASE_BUCKET || process.env["SUPABASE_BUCKET"] || "products";

  return { url, key, bucket };
}

/** Upload catalog.json to Supabase Storage if credentials are available */
async function syncCatalogToSupabase(
  catalog: Product[],
  env?: any,
): Promise<void> {
  const { url, key, bucket } = getSupabaseConfig(env);
  if (!url || !key) return; // Supabase not configured — skip silently

  try {
    const res = await fetch(`${url}/storage/v1/object/${bucket}/catalog.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
        "x-upsert": "true",
      },
      body: JSON.stringify(catalog),
    });
    if (res.ok) {
      console.log(`✅ [Catalog] Synced ${catalog.length} products to Supabase catalog.json`);
    } else {
      console.warn(`⚠️ [Catalog] Supabase sync warning: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.warn("⚠️ [Catalog] Supabase sync error (non-fatal):", err);
  }
}

/**
 * GET /api/catalog/products
 *
 * Priority:
 * 1. Cloud Firestore (primary — credentials always available via env binding)
 * 2. Supabase Storage catalog.json (public — no key needed for read)
 * 3. Bundled seed products (last resort)
 */
export async function handleGetCatalogProducts(env?: any): Promise<{
  status: number;
  body: Record<string, any>;
}> {
  // 1. Cloud Firestore — this is the canonical source after any save
  try {
    const db = getDb(env);
    const snapshot = await db.collection("products").get();

    if (!snapshot.empty && Array.isArray(snapshot.docs) && snapshot.docs.length > 0) {
      const dbProducts = snapshot.docs.map((doc: any) => doc.data() as Product);
      console.log(`✅ [Catalog] Loaded ${dbProducts.length} products from Firestore`);
      return { status: 200, body: { products: dbProducts } };
    }
  } catch (err) {
    console.warn("⚠️ [Catalog] Firestore read failed, trying Supabase:", err);
  }

  // 2. Supabase Storage (public bucket — no auth needed for read)
  const { url, bucket } = getSupabaseConfig(env);
  if (url) {
    try {
      const catalogUrl = `${url}/storage/v1/object/public/${bucket}/catalog.json?t=${Date.now()}`;
      const res = await fetch(catalogUrl);
      if (res.ok) {
        const cloudProducts = (await res.json()) as Product[];
        if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
          console.log(`✅ [Catalog] Loaded ${cloudProducts.length} products from Supabase`);
          return { status: 200, body: { products: cloudProducts } };
        }
      }
    } catch (err) {
      console.warn("⚠️ [Catalog] Supabase read failed, falling back to seed:", err);
    }
  }

  // 3. Bundled seed products
  console.log("ℹ️ [Catalog] Using bundled seed products");
  return { status: 200, body: { products: seedProducts } };
}

/**
 * POST /api/catalog/products
 *
 * Saves to Cloud Firestore (primary) and syncs to Supabase catalog.json (secondary).
 * Firestore is used as primary because Firebase credentials are always available via env binding.
 */
export async function handleSaveCatalogProduct(
  productData: Partial<Product>,
  env?: any,
): Promise<{ status: number; body: Record<string, any> }> {
  if (!productData || !productData.id || !productData.name) {
    return { status: 400, body: { error: "Product ID and Name are required" } };
  }

  // 1. Save to Firestore (primary write target)
  try {
    const db = getDb(env);
    await db.collection("products").doc(productData.id).set(productData, { merge: true });
    console.log(`✅ [Catalog] Saved "${productData.name}" (${productData.id}) to Firestore`);
  } catch (err: any) {
    console.error("❌ [Catalog] Firestore save failed:", err?.message || err);
    return {
      status: 500,
      body: { error: "Failed to save product — please try again" },
    };
  }

  // 2. Re-read all products from Firestore, then sync to Supabase catalog.json
  // Do this in the background — don't block the response
  handleGetCatalogProducts(env)
    .then(({ body }) => {
      if (body.products?.length) {
        return syncCatalogToSupabase(body.products as Product[], env);
      }
    })
    .catch((err) => console.warn("⚠️ [Catalog] Background Supabase sync error:", err));

  return { status: 200, body: { success: true, product: productData } };
}

/**
 * DELETE /api/catalog/products
 *
 * Deletes from Cloud Firestore (primary) and syncs updated catalog to Supabase.
 */
export async function handleDeleteCatalogProduct(
  productId: string,
  env?: any,
): Promise<{ status: number; body: Record<string, any> }> {
  if (!productId) {
    return { status: 400, body: { error: "Product ID is required" } };
  }

  // 1. Delete from Firestore
  try {
    const db = getDb(env);
    await db.collection("products").doc(productId).delete();
    console.log(`✅ [Catalog] Deleted ${productId} from Firestore`);
  } catch (err: any) {
    console.error("❌ [Catalog] Firestore delete failed:", err?.message || err);
    return {
      status: 500,
      body: { error: "Failed to delete product — please try again" },
    };
  }

  // 2. Sync updated catalog to Supabase in background
  handleGetCatalogProducts(env)
    .then(({ body }) => {
      if (body.products) {
        return syncCatalogToSupabase(body.products as Product[], env);
      }
    })
    .catch((err) => console.warn("⚠️ [Catalog] Background Supabase sync after delete error:", err));

  return { status: 200, body: { success: true, deletedId: productId } };
}
