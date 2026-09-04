import { ProductCard } from "./ProductCard";
import type { Product } from "@/data/types";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  layout?: "grid" | "list" | undefined;
  /** Columns at the xl breakpoint. Mobile is always 2-up, tablet 3-up. */
  columns?: 3 | 4 | undefined;
  className?: string | undefined;
}

export function ProductGrid({
  products,
  layout = "grid",
  columns = 4,
  className,
}: ProductGridProps) {
  if (layout === "list") {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} layout="list" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 items-stretch",
        columns === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3",
        className,
      )}
    >
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}
