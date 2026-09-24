import type { CustomerDetails, Order } from "@/data/types";
import { createCashfreeOrder } from "../cashfree";
import { verifyCartAndCalculateTotals, type ClientCartItemInput } from "../catalog";
import { getDb } from "../firebase";

export interface CreateOrderRequestBody {
  customer: CustomerDetails;
  items: ClientCartItemInput[];
}

function generateHumanOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${randomSuffix}`;
}

function validateCustomer(customer: CustomerDetails) {
  if (!customer) throw new Error("Customer information is required.");

  if (!customer.fullName || customer.fullName.trim().length < 2) {
    throw new Error("Please enter a valid full name.");
  }

  // 10-digit Indian mobile number
  const cleanedPhone = customer.mobileNumber ? customer.mobileNumber.replace(/\D/g, "") : "";
  const finalPhone = cleanedPhone.length === 12 && cleanedPhone.startsWith("91") ? cleanedPhone.slice(2) : cleanedPhone;
  if (!/^[6-9]\d{9}$/.test(finalPhone)) {
    throw new Error("Please enter a valid 10-digit Indian mobile number.");
  }

  // Email validation
  if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
    throw new Error("Please enter a valid email address.");
  }

  if (!customer.address || customer.address.trim().length < 5) {
    throw new Error("Please provide your complete delivery street address.");
  }

  if (!customer.city || customer.city.trim().length < 2) {
    throw new Error("Please enter your city.");
  }

  if (!customer.state || customer.state.trim().length < 2) {
    throw new Error("Please select or enter your state.");
  }

  // 6-digit Indian pincode
  const cleanedPincode = customer.pincode ? customer.pincode.replace(/\D/g, "") : "";
  if (!/^[1-9][0-9]{5}$/.test(cleanedPincode)) {
    throw new Error("Please enter a valid 6-digit postal pincode.");
  }

  return {
    ...customer,
    fullName: customer.fullName.trim(),
    email: customer.email.trim().toLowerCase(),
    mobileNumber: finalPhone,
    address: customer.address.trim(),
    city: customer.city.trim(),
    state: customer.state.trim(),
    pincode: cleanedPincode,
  };
}

export async function handleCreateOrder(body: CreateOrderRequestBody, reqUrl: string) {
  // 1. Validate Customer Information
  const validatedCustomer = validateCustomer(body.customer);

  // 2. Authoritative Price & Item Calculation (Never trusts client prices or totals)
  const calculation = await verifyCartAndCalculateTotals(body.items);

  // 3. Generate Human-Friendly Order ID
  const orderId = generateHumanOrderId();
  const db = getDb();
  const orderDocRef = db.collection("orders").doc(orderId);

  const baseUrl = process.env["APP_URL"] || new URL(reqUrl).origin;
  const returnUrl = `${baseUrl}/order/${orderId}?cf_id={order_id}`;
  const notifyUrl = `${baseUrl}/api/payments/cashfree/webhook`;

  // 4. Create internal Firebase Order with PENDING_PAYMENT
  const initialOrder: Order = {
    id: orderId,
    orderId,
    customer: validatedCustomer,
    items: calculation.items,
    subtotal: calculation.subtotal,
    shippingAmount: calculation.shippingAmount,
    totalAmount: calculation.totalAmount,
    currency: "INR",
    payment: {
      gateway: "cashfree",
      status: "PENDING",
    },
    status: "PENDING_PAYMENT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await orderDocRef.set(initialOrder);

  // 5. Create Cashfree Order to obtain payment session
  const cfResult = await createCashfreeOrder({
    orderId,
    orderAmount: calculation.totalAmount,
    orderCurrency: "INR",
    customer: {
      id: `cust_${validatedCustomer.mobileNumber}`,
      name: validatedCustomer.fullName,
      email: validatedCustomer.email,
      phone: validatedCustomer.mobileNumber,
    },
    returnUrl,
    notifyUrl,
    orderNote: `Velora Jewelry Order ${orderId}`,
  });

  // 6. Update internal order with gateway references
  await orderDocRef.update({
    "payment.gatewayOrderId": cfResult.cfOrderId,
    "payment.paymentSessionId": cfResult.paymentSessionId,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    orderId,
    paymentSessionId: cfResult.paymentSessionId,
    cfOrderId: cfResult.cfOrderId,
    totalAmount: calculation.totalAmount,
    currency: "INR",
  };
}
