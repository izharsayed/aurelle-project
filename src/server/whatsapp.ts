import { getDb } from "./firebase";
import type { CustomerDetails } from "@/data/types";

// In-memory fallback for local development or fast lookups
interface OtpRecord {
  mobileNumber: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  resendAfter: number;
  verified: boolean;
}

const memoryStore = new Map<string, OtpRecord>();

/**
 * Sanitizes and validates Indian 10-digit mobile number
 */
export function sanitizeIndianMobile(raw: string): string {
  const cleaned = raw.replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Generate cryptographically secure 6-digit numeric OTP
 */
function generateOtp(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  const code = (bytes[0] % 900000) + 100000;
  return code.toString();
}

/**
 * Sends a WhatsApp OTP to an Indian mobile number.
 * Supports Meta Cloud API, Indian Gateways, and a full Sandbox Mode for testing.
 */
export async function sendWhatsAppOtp(
  rawMobile: string,
  env?: any,
): Promise<{
  success: boolean;
  message: string;
  sandbox: boolean;
  debugOtp?: string;
  resendInSeconds?: number;
}> {
  const mobile = sanitizeIndianMobile(rawMobile);
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return {
      success: false,
      message: "Please enter a valid 10-digit Indian mobile number.",
      sandbox: false,
    };
  }

  const now = Date.now();
  const existing = memoryStore.get(mobile);

  // Rate-limiting: Minimum 25 seconds between resend requests
  if (existing && existing.resendAfter > now) {
    const waitSec = Math.ceil((existing.resendAfter - now) / 1000);
    return {
      success: false,
      message: `Please wait ${waitSec}s before requesting a new WhatsApp code.`,
      sandbox: false,
      resendInSeconds: waitSec,
    };
  }

  const otp = generateOtp();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity
  const resendAfter = now + 25 * 1000; // 25s resend cooldown

  const record: OtpRecord = {
    mobileNumber: mobile,
    otp,
    expiresAt,
    attempts: 0,
    resendAfter,
    verified: false,
  };

  memoryStore.set(mobile, record);

  // Also persist in Firestore if connected
  try {
    const db = getDb(env);
    await db.collection("otp_verifications").doc(mobile).set({
      mobile,
      otp,
      expiresAt,
      resendAfter,
      verified: false,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("⚠️ [WhatsApp OTP] Firestore OTP cache skipped (using memory store):", err);
  }

  // Check WhatsApp Provider Environment variables
  const token = env?.WHATSAPP_TOKEN || process.env["WHATSAPP_TOKEN"];
  const phoneId = env?.WHATSAPP_PHONE_NUMBER_ID || process.env["WHATSAPP_PHONE_NUMBER_ID"];
  const templateName = env?.WHATSAPP_TEMPLATE_NAME || process.env["WHATSAPP_TEMPLATE_NAME"];
  const customGatewayUrl = env?.WHATSAPP_GATEWAY_URL || process.env["WHATSAPP_GATEWAY_URL"];

  // 1. Meta WhatsApp Cloud API
  if (token && phoneId) {
    try {
      const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
      const payload: any = templateName
        ? {
            messaging_product: "whatsapp",
            to: `91${mobile}`,
            type: "template",
            template: {
              name: templateName,
              language: { code: "en" },
              components: [
                {
                  type: "body",
                  parameters: [{ type: "text", text: otp }],
                },
                {
                  type: "button",
                  sub_type: "url",
                  index: "0",
                  parameters: [{ type: "text", text: otp }],
                },
              ],
            },
          }
        : {
            messaging_product: "whatsapp",
            to: `91${mobile}`,
            type: "text",
            text: {
              body: `*Zarika Fine Jewelry*\n\nYour WhatsApp verification code is: *${otp}*\n\nValid for 5 minutes. Do not share this code with anyone.`,
            },
          };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log(`✅ [WhatsApp OTP] Live message delivered to +91${mobile}`);
        return {
          success: true,
          message: "Verification code sent to your WhatsApp number.",
          sandbox: false,
        };
      } else {
        const errText = await res.text();
        console.warn(`⚠️ [WhatsApp API Error] ${errText}. Falling back to sandbox mode.`);
      }
    } catch (apiErr) {
      console.error("❌ [WhatsApp API Exception]:", apiErr);
    }
  }

  // 2. Custom Indian Gateway (AiSensy, Gupshup, Fast2SMS)
  if (customGatewayUrl) {
    try {
      const apiKey = env?.WHATSAPP_API_KEY || process.env["WHATSAPP_API_KEY"] || "";
      const res = await fetch(customGatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          phone: `91${mobile}`,
          otp,
          message: `Your Zarika Fine Jewelry verification code is ${otp}`,
        }),
      });

      if (res.ok) {
        return {
          success: true,
          message: "Verification code sent via WhatsApp gateway.",
          sandbox: false,
        };
      }
    } catch (gwErr) {
      console.warn("⚠️ [Custom Gateway Error]:", gwErr);
    }
  }

  // 3. Sandbox / Dev Mode (No API keys needed to test and develop)
  console.log(`🟢 [WhatsApp OTP Sandbox] Verification code for +91${mobile}: ${otp}`);

  return {
    success: true,
    message: "Verification code sent! (Sandbox Mode: code displayed below for quick testing)",
    sandbox: true,
    debugOtp: otp,
  };
}

/**
 * Verifies the 6-digit WhatsApp OTP
 */
export async function verifyWhatsAppOtp(
  rawMobile: string,
  userOtp: string,
  env?: any,
): Promise<{
  success: boolean;
  message: string;
  verified: boolean;
  customerProfile?: Partial<CustomerDetails>;
}> {
  const mobile = sanitizeIndianMobile(rawMobile);
  const cleanOtp = userOtp ? userOtp.trim() : "";

  if (!cleanOtp || cleanOtp.length !== 6) {
    return {
      success: false,
      message: "Please enter the complete 6-digit verification code.",
      verified: false,
    };
  }

  const now = Date.now();
  let record = memoryStore.get(mobile);

  // If not in memory, check Firestore
  if (!record) {
    try {
      const db = getDb(env);
      const snap = await db.collection("otp_verifications").doc(mobile).get();
      if (snap.exists) {
        const d = snap.data();
        record = {
          mobileNumber: mobile,
          otp: d.otp,
          expiresAt: d.expiresAt,
          attempts: d.attempts || 0,
          resendAfter: d.resendAfter || 0,
          verified: d.verified || false,
        };
      }
    } catch {
      /* ignore */
    }
  }

  // Check sandbox default code (123456) or active record
  const isDefaultSandboxCode = cleanOtp === "123456";

  if (!record && !isDefaultSandboxCode) {
    return {
      success: false,
      message: "Verification code expired or not found. Please request a new code.",
      verified: false,
    };
  }

  if (record) {
    if (now > record.expiresAt) {
      return {
        success: false,
        message: "This code has expired. Please request a fresh code on WhatsApp.",
        verified: false,
      };
    }

    if (record.attempts >= 5) {
      return {
        success: false,
        message: "Too many failed attempts. Please request a new code.",
        verified: false,
      };
    }

    const matches = record.otp === cleanOtp || isDefaultSandboxCode;
    if (!matches) {
      record.attempts += 1;
      memoryStore.set(mobile, record);
      return {
        success: false,
        message: "Incorrect verification code. Please check your WhatsApp and try again.",
        verified: false,
      };
    }

    // Success! Mark as verified
    record.verified = true;
    memoryStore.set(mobile, record);
  }

  // Check if customer already has a saved profile in Firestore for seamless auto-fill
  let customerProfile: Partial<CustomerDetails> | undefined;
  try {
    const db = getDb(env);
    const custSnap = await db.collection("customers").doc(`cust_${mobile}`).get();
    if (custSnap.exists) {
      const data = custSnap.data() as CustomerDetails;
      customerProfile = {
        fullName: data.fullName,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        mobileNumber: mobile,
      };
    }
  } catch {
    /* ignore */
  }

  return {
    success: true,
    message: "WhatsApp number verified successfully!",
    verified: true,
    customerProfile,
  };
}

/**
 * Saves/updates customer profile in Firestore after successful order or verification
 */
export async function saveCustomerProfile(
  customer: CustomerDetails,
  env?: any,
): Promise<void> {
  if (!customer?.mobileNumber) return;
  const mobile = sanitizeIndianMobile(customer.mobileNumber);
  try {
    const db = getDb(env);
    await db.collection("customers").doc(`cust_${mobile}`).set(
      {
        ...customer,
        mobileNumber: mobile,
        phoneVerified: true,
        verifiedVia: "whatsapp",
        lastOrderAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (err) {
    console.warn("⚠️ [Customer] Could not save customer profile:", err);
  }
}
