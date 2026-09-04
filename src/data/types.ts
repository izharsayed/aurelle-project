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
  finish?: string;
  quantity: number;
  totalPrice: number;
  message: string;
}

