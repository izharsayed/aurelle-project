/**
 * Edge- & Cloudflare-compatible Firestore client
 *
 * Replaces heavy Node-only `firebase-admin` (which pulls in 6MB+ of gRPC and fails in Rolldown/Cloudflare Pages)
 * with a lightweight, standard Web Crypto + HTTPS REST implementation.
 *
 * Supported modes:
 * 1. Mock Mode (default): In-memory Map storage for seamless local development without setup.
 * 2. Live Mode: Directly communicates with Google Cloud Firestore REST API using Service Account credentials.
 */

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

// In-memory Firestore adapter for dev mode
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

// REST Helpers to convert JS Objects <-> Firestore REST JSON format
function toFirestoreFields(obj: Record<string, unknown>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      fields[k] = toFirestoreValue(v);
    }
  }
  return fields;
}

function toFirestoreValue(v: any): any {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v) ? { integerValue: v.toString() } : { doubleValue: v };
  }
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map(toFirestoreValue) } };
  }
  if (typeof v === "object") {
    return { mapValue: { fields: toFirestoreFields(v) } };
  }
  return { stringValue: String(v) };
}

function fromFirestoreFields(fields: Record<string, any> | undefined): Record<string, any> {
  if (!fields) return {};
  const res: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) {
    res[k] = fromFirestoreValue(v);
  }
  return res;
}

function fromFirestoreValue(v: any): any {
  if (!v || typeof v !== "object") return v;
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return parseInt(v.integerValue, 10);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) {
    return (v.arrayValue.values || []).map(fromFirestoreValue);
  }
  if ("mapValue" in v) {
    return fromFirestoreFields(v.mapValue.fields);
  }
  return null;
}

// OAuth2 Google Access Token Manager using Web Crypto
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getGoogleAccessToken(clientEmail: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 300) {
    return cachedToken.token;
  }

  // Base64URL helper
  const b64url = (str: string) => {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: clientEmail,
      sub: clientEmail,
      aud: "https://oauth2.googleapis.com/token",
      scope: "https://www.googleapis.com/auth/datastore",
      iat: now,
      exp: now + 3600,
    })
  );

  const unsignedToken = `${header}.${payload}`;

  // Clean PEM
  const pemBody = privateKeyPem
    .replace(/-----BEGIN [A-Z ]+-----/g, "")
    .replace(/-----END [A-Z ]+-----/g, "")
    .replace(/\s+/g, "");

  const binaryDer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBytes = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert signature Uint8Array to base64url
  let binarySig = "";
  const sigView = new Uint8Array(sigBytes);
  for (let i = 0; i < sigView.length; i++) {
    binarySig += String.fromCharCode(sigView[i]!);
  }
  const signature = b64url(binarySig);
  const jwt = `${unsignedToken}.${signature}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Google OAuth2 token exchange failed: ${errText}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: tokenData.access_token,
    expiresAt: now + (tokenData.expires_in || 3600),
  };

  return cachedToken.token;
}

/**
 * Creates live Firestore REST adapter
 */
function createRestFirestore(projectId: string, clientEmail: string, privateKey: string): any {
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  const getHeaders = async () => {
    const token = await getGoogleAccessToken(clientEmail, privateKey);
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  return {
    collection: (collName: string) => {
      const collUrl = `${baseUrl}/${collName}`;

      return {
        doc: (docId?: string) => {
          const id = docId || `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const docUrl = `${collUrl}/${id}`;

          return {
            id,
            get: async () => {
              const headers = await getHeaders();
              const res = await fetch(docUrl, { headers });
              if (res.status === 404) {
                return { id, exists: false, data: () => undefined };
              }
              if (!res.ok) {
                throw new Error(`Firestore GET error (${res.status}): ${await res.text()}`);
              }
              const json = (await res.json()) as { fields?: Record<string, any> };
              return {
                id,
                exists: true,
                data: () => fromFirestoreFields(json.fields),
              };
            },
            set: async (data: Record<string, unknown>, options?: { merge?: boolean }) => {
              const headers = await getHeaders();
              const fields = toFirestoreFields(data);

              if (options?.merge) {
                // If merging, specify updateMask for existing keys
                const updateMask = Object.keys(data)
                  .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
                  .join("&");
                const patchUrl = `${docUrl}${updateMask ? `?${updateMask}` : ""}`;
                const res = await fetch(patchUrl, {
                  method: "PATCH",
                  headers,
                  body: JSON.stringify({ fields }),
                });
                if (!res.ok) {
                  throw new Error(`Firestore SET/PATCH error (${res.status}): ${await res.text()}`);
                }
              } else {
                // Overwrite
                const res = await fetch(docUrl, {
                  method: "PATCH",
                  headers,
                  body: JSON.stringify({ fields }),
                });
                if (!res.ok) {
                  throw new Error(`Firestore SET error (${res.status}): ${await res.text()}`);
                }
              }
            },
            update: async (updates: Record<string, unknown>) => {
              const headers = await getHeaders();
              const fields = toFirestoreFields(updates);
              const updateMask = Object.keys(updates)
                .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
                .join("&");
              const patchUrl = `${docUrl}?${updateMask}`;

              const res = await fetch(patchUrl, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ fields }),
              });
              if (!res.ok) {
                throw new Error(`Firestore UPDATE error (${res.status}): ${await res.text()}`);
              }
            },
            delete: async () => {
              const headers = await getHeaders();
              const res = await fetch(docUrl, {
                method: "DELETE",
                headers,
              });
              if (!res.ok && res.status !== 404) {
                throw new Error(`Firestore DELETE error (${res.status}): ${await res.text()}`);
              }
            },
          };
        },
        orderBy: (_field: string, _dir?: "asc" | "desc") => {
          // List documents in collection
          return {
            get: async () => {
              const headers = await getHeaders();
              const res = await fetch(collUrl, { headers });
              if (!res.ok) {
                throw new Error(`Firestore LIST error (${res.status}): ${await res.text()}`);
              }
              const json = (await res.json()) as { documents?: Array<{ name: string; fields?: Record<string, any> }> };
              const docs = (json.documents || []).map((doc) => {
                const docId = doc.name.split("/").pop() || "";
                return {
                  id: docId,
                  exists: true,
                  data: () => fromFirestoreFields(doc.fields),
                };
              });
              return { empty: docs.length === 0, docs };
            },
          };
        },
        where: () => ({
          get: async () => {
            const headers = await getHeaders();
            const res = await fetch(collUrl, { headers });
            if (!res.ok) {
              throw new Error(`Firestore WHERE query error (${res.status}): ${await res.text()}`);
            }
            const json = (await res.json()) as { documents?: Array<{ name: string; fields?: Record<string, any> }> };
            const docs = (json.documents || []).map((doc) => {
              const docId = doc.name.split("/").pop() || "";
              return {
                id: docId,
                exists: true,
                data: () => fromFirestoreFields(doc.fields),
              };
            });
            return { empty: docs.length === 0, docs };
          },
        }),
        get: async () => {
          const headers = await getHeaders();
          const res = await fetch(collUrl, { headers });
          if (!res.ok) {
            throw new Error(`Firestore LIST error (${res.status}): ${await res.text()}`);
          }
          const json = (await res.json()) as { documents?: Array<{ name: string; fields?: Record<string, any> }> };
          const docs = (json.documents || []).map((doc) => {
            const docId = doc.name.split("/").pop() || "";
            return {
              id: docId,
              exists: true,
              data: () => fromFirestoreFields(doc.fields),
            };
          });
          return { empty: docs.length === 0, docs };
        },
      };
    },
  };
}

let activeDb: any = null;
let isMock = true;

export function initFirebase() {
  if (activeDb) return { db: activeDb, isMock };

  const projectId = process.env["FIREBASE_PROJECT_ID"];
  const clientEmail = process.env["FIREBASE_CLIENT_EMAIL"];
  let privateKey = process.env["FIREBASE_PRIVATE_KEY"];

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (projectId && clientEmail && privateKey) {
    try {
      activeDb = createRestFirestore(projectId, clientEmail, privateKey);
      isMock = false;
      console.log("🔥 [Firebase] Initialized Cloud Firestore REST client.");
      return { db: activeDb, isMock: false };
    } catch (err) {
      console.warn("⚠️ [Firebase] Failed to initialize Firestore REST client, falling back to mock:", err);
    }
  }

  isMock = true;
  activeDb = getMockFirestore();
  return { db: activeDb, isMock: true };
}

export function getDb(): any {
  return initFirebase().db;
}

export function isUsingMockFirebase(): boolean {
  return isMock;
}
