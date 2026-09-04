import type { OccasionSlug, Product } from "@/data/types";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "name";

export interface FilterState {
  categories: string[];
  colors: string[];
  collections: string[];
  occasions: OccasionSlug[];
  price: [number, number];
  inStockOnly: boolean;
  query: string;
}

export const emptyFilters = (max: number): FilterState => ({
  categories: [],
  colors: [],
  collections: [],
  occasions: [],
  price: [0, max],
  inStockOnly: false,
  query: "",
});

export const activeFilterCount = (f: FilterState, max: number) =>
  f.categories.length +
  f.colors.length +
  f.collections.length +
  f.occasions.length +
  (f.inStockOnly ? 1 : 0) +
  (f.price[0] > 0 || f.price[1] < max ? 1 : 0);

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "New arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "name", label: "Alphabetical" },
];

const priceOf = (p: Product) => p.salePrice ?? p.price;

export const applyFilters = (items: Product[], filters: FilterState, sort: SortKey): Product[] => {
  const q = filters.query.trim().toLowerCase();

  const filtered = items.filter((p) => {
    if (filters.categories.length && !filters.categories.includes(p.category)) return false;
    if (filters.collections.length && !filters.collections.includes(p.collection)) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    if (filters.colors.length && !p.colors.some((c) => filters.colors.includes(c.name)))
      return false;
    if (filters.occasions.length && !p.occasions.some((o) => filters.occasions.includes(o)))
      return false;
    const price = priceOf(p);
    if (price < filters.price[0] || price > filters.price[1]) return false;
    if (q && ![p.name, p.description, p.collection, ...p.tags].join(" ").toLowerCase().includes(q))
      return false;
    return true;
  });

  const sorted = [...filtered];
  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => priceOf(a) - priceOf(b));
      break;
    case "price-desc":
      sorted.sort((a, b) => priceOf(b) - priceOf(a));
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      sorted.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
      break;
    default:
      sorted.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) || Number(b.bestSeller) - Number(a.bestSeller),
      );
  }
  return sorted;
};
