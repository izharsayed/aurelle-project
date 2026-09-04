import { Heart } from "lucide-react";
import { useStore } from "@/context/store-context";
import type { Product } from "@/data/types";
import { cn } from "@/lib/utils";

export function WishlistButton({
  product,
  className,
  tone = "surface",
}: {
  product: Product;
  className?: string | undefined;
  tone?: "surface" | "bare" | undefined;
}) {
  const { isWishlisted, toggleWishlist } = useStore();
  const active = isWishlisted(product.id);

  return (
    <button
      type="button"
      onClick={() => toggleWishlist(product)}
      aria-pressed={active}
      aria-label={
        active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
      }
      className={cn(
        "group/wl inline-flex size-9 items-center justify-center rounded-full transition-all duration-300",
        tone === "surface"
          ? "bg-card/90 shadow-soft backdrop-blur-[2px] hover:bg-card"
          : "hover:text-gold",
        className,
      )}
    >
      <Heart
        aria-hidden
        strokeWidth={1.25}
        className={cn(
          "size-4 transition-all duration-300",
          active ? "fill-gold text-gold" : "text-foreground group-hover/wl:text-gold",
        )}
      />
    </button>
  );
}
