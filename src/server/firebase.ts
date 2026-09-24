import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let firestoreDb: Firestore | null = null;
let isMock = false;

// In-memory fallback store for local development when Firebase credentials are not yet populated in .env
interface MockDoc {
  data: Record<string, unknown>;
  id: string;
}
const mockCollections: Map<string, Map<string, MockDoc>> = new Map();

function getMockCollection(name: string) {
  if (!mockCollections.has(name)) {
    mockCollections.set(name, new Map());
  }
  return mockCollections.get(name)!;
}

export function initFirebase() {
  if (firestoreDb) return { db: firestoreDb, isMock: false };

  const projectId = process.env["FIREBASE_PROJECT_ID"];
  const clientEmail = process.env["FIREBASE_CLIENT_EMAIL"];
  let privateKey = process.env["FIREBASE_PRIVATE_KEY"];

  if (privateKey) {
    // Handle escaped newlines from .env
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  // Check if live credentials are provided
  if (projectId && clientEmail && privateKey) {
    try {
      if (getApps().length === 0) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        console.log("🔥 [Firebase] Initialized Firebase Admin SDK with Cloud Firestore.");
      }
      firestoreDb = getFirestore();
      isMock = false;
      return { db: firestoreDb, isMock: false };
    } catch (err) {
      console.warn("⚠️ [Firebase] Failed to initialize live Firebase Admin:", err);
    }
  }

  // Graceful in-memory fallback for local development before .env credentials are added
  isMock = true;
  return { db: getMockFirestore(), isMock: true };
}

export function getDb(): any {
  return initFirebase().db;
}

export function isUsingMockFirebase() {
  return isMock;
}

/**
 * Lightweight in-memory Firestore-compatible adapter for local dev without credentials
 */
function getMockFirestore(): any {
  return {
    collection: (collName: string) => {
      const coll = getMockCollection(collName);
      return {
        doc: (docId?: string) => {
          const id = docId || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          return {
            id,
            get: async () => {
              const item = coll.get(id);
              return {
                id,
                exists: Boolean(item),
                data: () => item?.data,
              };
            },
            set: async (data: Record<string, unknown>, options?: { merge?: boolean }) => {
              const existing = coll.get(id);
              if (options?.merge && existing) {
                coll.set(id, { id, data: { ...existing.data, ...data } });
              } else {
                coll.set(id, { id, data });
              }
            },
            update: async (updates: Record<string, unknown>) => {
              const existing = coll.get(id);
              if (!existing) throw new Error(`Document ${id} does not exist`);
              coll.set(id, { id, data: { ...existing.data, ...updates } });
            },
            delete: async () => {
              coll.delete(id);
            },
          };
        },
        where: () => ({
          get: async () => ({
            empty: coll.size === 0,
            docs: Array.from(coll.values()).map((v) => ({
              id: v.id,
              exists: true,
              data: () => v.data,
            })),
          }),
        }),
        orderBy: () => ({
          get: async () => ({
            empty: coll.size === 0,
            docs: Array.from(coll.values()).map((v) => ({
              id: v.id,
              exists: true,
              data: () => v.data,
            })),
          }),
        }),
        get: async () => ({
          empty: coll.size === 0,
          docs: Array.from(coll.values()).map((v) => ({
            id: v.id,
            exists: true,
            data: () => v.data,
          })),
        }),
      };
    },
  };
}
