import type { FaqItem, Review, Testimonial } from "./types";

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Ananya Iyer",
    location: "Bengaluru",
    rating: 5,
    initials: "AI",
    review:
      "I wore the Meher chandelier earrings to my sister's reception and three people asked if they were real gold. The finish is genuinely beautiful and they weigh almost nothing.",
  },
  {
    id: "t2",
    name: "Ritika Sharma",
    location: "Delhi",
    rating: 5,
    initials: "RS",
    review:
      "Ordering over WhatsApp took two minutes and the parcel arrived in a proper gift box. It felt like buying from a boutique, not an online store.",
  },
  {
    id: "t3",
    name: "Fatima Qureshi",
    location: "Hyderabad",
    rating: 4,
    initials: "FQ",
    review:
      "The everyday chain has been on my neck for four months — showers, gym, everything — and it hasn't dulled at all. Excellent value for the price.",
  },
  {
    id: "t4",
    name: "Meera Nair",
    location: "Kochi",
    rating: 5,
    initials: "MN",
    review:
      "I bought the bridal set for my wedding after seeing it online and was nervous. It looked even better in person. My photographer kept photographing my neckline.",
  },
  {
    id: "t5",
    name: "Sanya Kapoor",
    location: "Mumbai",
    rating: 5,
    initials: "SK",
    review:
      "Beautifully understated pieces. I gifted the pearl studs to my mother and ended up buying a second pair for myself the same week.",
  },
  {
    id: "t6",
    name: "Divya Menon",
    location: "Chennai",
    rating: 4,
    initials: "DM",
    review:
      "Lovely designs and the team answered every question on WhatsApp before I paid. Delivery took four days to Chennai.",
  },
];

export const productReviews: Review[] = [
  {
    id: "r1",
    name: "Priya Deshmukh",
    initials: "PD",
    rating: 5,
    date: "2 weeks ago",
    title: "Looks far more expensive than it is",
    body: "The plating has a soft warm tone rather than that harsh yellow you usually get with artificial jewelry. Comfortable for a full evening.",
  },
  {
    id: "r2",
    name: "Nisha Raghavan",
    initials: "NR",
    rating: 5,
    date: "1 month ago",
    title: "Perfect for gifting",
    body: "Arrived in a lovely box with a soft pouch inside. I didn't need to wrap it at all — gave it exactly as it came.",
  },
  {
    id: "r3",
    name: "Aisha Khan",
    initials: "AK",
    rating: 4,
    date: "1 month ago",
    title: "Beautiful, slightly delicate",
    body: "Gorgeous piece and true to the photos. I'd handle it gently, but that's true of anything this fine. Would buy again.",
  },
];

export const faqs: FaqItem[] = [
  {
    id: "f1",
    category: "Ordering",
    question: "How do I place an order?",
    answer:
      "Browse the pieces you like and tap 'Order on WhatsApp' on any product. Your selection, colour and quantity are prefilled into a message so our team can confirm availability, share payment options and give you a delivery date in one conversation.",
  },
  {
    id: "f2",
    category: "Ordering",
    question: "Can I order more than one piece at a time?",
    answer:
      "Yes. Send us each piece you would like on WhatsApp, or simply tell our team what you're looking for. We'll put together a single order and a combined shipping quote.",
  },
  {
    id: "f3",
    category: "Payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, all major debit and credit cards, net banking and bank transfer. Payment links are shared securely on WhatsApp once your order is confirmed.",
  },
  {
    id: "f4",
    category: "Shipping",
    question: "How long does delivery take?",
    answer:
      "Orders are dispatched within 24–48 hours. Metro cities usually receive their parcel in 2–4 working days, and other locations in 4–7 working days. A tracking link is shared as soon as your parcel leaves us.",
  },
  {
    id: "f5",
    category: "Shipping",
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship worldwide through tracked courier partners. International shipping is quoted per order based on weight and destination.",
  },
  {
    id: "f6",
    category: "Returns",
    question: "What is your return policy?",
    answer:
      "You can request a return or exchange within 7 days of delivery, provided the piece is unworn and in its original packaging. Share an unboxing photo on WhatsApp and we'll arrange a pickup.",
  },
  {
    id: "f7",
    category: "Quality",
    question: "What are your pieces made of?",
    answer:
      "Most pieces are brass or high-grade alloy finished with 18K gold or rhodium plating, then sealed with an anti-tarnish coat. Stones are cubic zirconia, glass crystal or resin, and pearls are premium shell pearls.",
  },
  {
    id: "f8",
    category: "Quality",
    question: "Will the plating change colour?",
    answer:
      "With reasonable care our anti-tarnish finish holds its tone for 12–18 months of regular wear. Perfume, chlorine and abrasive cleaners are the main culprits behind early dulling.",
  },
  {
    id: "f9",
    category: "Care",
    question: "How should I care for artificial jewelry?",
    answer:
      "Put your jewelry on last and take it off first. Keep it away from perfume, lotion and water, wipe it with a dry cotton cloth after wear, and store each piece in the pouch it arrived in, away from humidity.",
  },
  {
    id: "f10",
    category: "Care",
    question: "Is your jewelry safe for sensitive skin?",
    answer:
      "Our pieces are nickel-free and lead-free. If you have very reactive skin, we recommend our rhodium-plated pieces, which sit best against sensitive ears.",
  },
];

export const popularSearches = [
  "pearl earrings",
  "bridal set",
  "gold hoops",
  "layered necklace",
  "kundan bangles",
  "everyday rings",
];

export const recentSearches = ["chandelier earrings", "cuff bracelet", "choker"];
