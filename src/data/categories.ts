import { img } from "./images";
import type { Category, Occasion } from "./types";

export const categories: Category[] = [
  {
    slug: "earrings",
    name: "Earrings",
    description:
      "From barely-there studs to sculptural chandeliers — earrings that frame the face and finish the look.",
    image: img.earrings,
  },
  {
    slug: "necklaces",
    name: "Necklaces",
    description:
      "Fine chains, pendants and statement collars designed to layer beautifully or stand entirely alone.",
    image: img.necklaces,
  },
  {
    slug: "bracelets",
    name: "Bracelets",
    description:
      "Delicate chains and hammered cuffs with an easy, everyday weight you'll forget you're wearing.",
    image: img.bracelets,
  },
  {
    slug: "bangles",
    name: "Bangles",
    description:
      "Traditional silhouettes reworked with a lighter hand — stack them high or wear a single note.",
    image: img.bangles,
  },
  {
    slug: "rings",
    name: "Rings",
    description: "Slim bands, stone settings and bold cocktail pieces, sized to be lived in.",
    image: img.rings,
  },
  {
    slug: "jewelry-sets",
    name: "Jewelry Sets",
    description:
      "Perfectly matched pairings and full bridal suites — the whole look, considered for you.",
    image: img.sets,
  },
];

export const occasions: Occasion[] = [
  {
    slug: "wedding",
    name: "Wedding",
    tagline: "Heirloom-worthy bridal suites",
    image: img.wedding,
  },
  {
    slug: "festive",
    name: "Festive",
    tagline: "Warm gold for celebration season",
    image: img.festive,
  },
  {
    slug: "party",
    name: "Party",
    tagline: "Pieces that catch the light",
    image: img.party,
  },
  {
    slug: "everyday",
    name: "Everyday",
    tagline: "Quiet gold you never take off",
    image: img.everyday,
  },
  {
    slug: "gifting",
    name: "Gifting",
    tagline: "Boxed and ready to give",
    image: img.gifting,
  },
];

export const collections = [
  "Velora Signature",
  "Heirloom Bridal",
  "Everyday Fine",
  "Festive Nights",
  "Pearl Study",
];

export const colorOptions = [
  { name: "Gold", hex: "#C8A96A" },
  { name: "Rose Gold", hex: "#D9A6A0" },
  { name: "Silver", hex: "#C6CBD1" },
  { name: "Pearl White", hex: "#F3EDE3" },
  { name: "Emerald", hex: "#2F6B57" },
  { name: "Ruby", hex: "#8E2B3C" },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
