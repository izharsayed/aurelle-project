export type CategorySlug =
  "earrings" | "necklaces" | "bracelets" | "bangles" | "rings" | "jewelry-sets";

export type OccasionSlug = "wedding" | "festive" | "party" | "everyday" | "gifting";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: CategorySlug;
  price: number;
  salePrice: number | null;
  description: string;
  longDescription: string;
  material: string;
  care: string;
  colors: ProductColor[];
  /** Ordered gallery. First entry is the primary card image. */
  images: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  inStock: boolean;
  tags: string[];
  occasions: OccasionSlug[];
  collection: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
}

export interface Occasion {
  slug: OccasionSlug;
  name: string;
  tagline: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  initials: string;
}

export interface Review {
  id: string;
  name: string;
  initials: string;
  rating: number;
  date: string;
  title: string;
  body: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface InquiryRecord {
  id: string;
  timestamp: string;
  productName: string;
  productSku: string;
  category: CategorySlug;
  finish?: string | undefined;
  quantity: number;
  totalPrice: number;
  message: string;
}

// -------------------------------------------------------------
// E-Commerce Cart, Checkout & Orders Types
// -------------------------------------------------------------

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice: number | null;
  image: string;
  color?: string | undefined;
  quantity: number;
}

export interface CustomerDetails {
  fullName: string;
  mobileNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  subtotal: number;
  color?: string | undefined;
  image?: string | undefined;
}

export interface OrderPayment {
  gateway: "cashfree";
  gatewayOrderId?: string | undefined;
  gatewayPaymentId?: string | undefined;
  status: PaymentStatus;
  method?: string | undefined;
  paymentSessionId?: string | undefined;
  paidAt?: string | undefined;
}

export interface Order {
  id: string; // Firestore document ID
  orderId: string; // Human-friendly order number e.g. ORD-2026-000001
  customerId?: string | undefined;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  currency: "INR";
  payment: OrderPayment;
  status: OrderStatus;
  notes?: string | undefined;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface PaymentRecord {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  gateway: "cashfree";
  status: PaymentStatus;
  method?: string | undefined;
  bankReference?: string | undefined;
  rawResponse?: Record<string, unknown> | undefined;
  createdAt: string;
}


