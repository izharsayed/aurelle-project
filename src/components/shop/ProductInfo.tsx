import { useState } from "react";
import { Check, Minus, Plus, Share2, Truck } from "lucide-react";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { ProductBadge } from "./ProductBadge";
import { Stars } from "@/components/site/Stars";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";
import type { Product } from "@/data/types";
import { discountPercent, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductInfo({ product }: { product: Product }) {
  const { isWishlisted, toggleWishlist } = useStore();
  const [color, setColor] = useState(product.colors[0]?.name ?? "Gold");
  const [quantity, setQuantity] = useState(1);
  const [shared, setShared] = useState(false);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <p className="eyebrow">{product.collection}</p>
        {product.salePrice ? (
          <ProductBadge tone="sale">
            {`${discountPercent(product.price, product.salePrice)}% off`}
          </ProductBadge>
        ) : null}
        {product.bestSeller ? <ProductBadge tone="best">Bestseller</ProductBadge> : null}
      </div>

      <h1 className="display-xl text-3xl sm:text-4xl lg:text-[2.75rem]">{product.name}</h1>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <Stars rating={product.rating} />
          {product.rating.toFixed(1)} · {product.reviewCount} reviews
        </span>
        <span>SKU {product.sku}</span>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="font-serif text-3xl">
          {formatPrice(product.salePrice ?? product.price)}
        </span>
        {product.salePrice ? (
          <>
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs tracking-[0.16em] uppercase text-gold">
              Save {formatPrice(product.price - product.salePrice)}
            </span>
          </>
        ) : null}
      </div>

      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
        {product.longDescription}
      </p>

      <div className="border-t border-border pt-6">
        <p className="eyebrow mb-3">Finish — {color}</p>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(c.name)}
              aria-pressed={color === c.name}
              className={cn(
                "flex cursor-pointer items-center gap-2 border px-3 py-2 text-xs transition-colors",
                color === c.name
                  ? "border-gold text-foreground"
                  : "border-border text-muted-foreground hover:border-gold/50",
              )}
            >
              <span
                aria-hidden
                className="size-3.5 rounded-full ring-1 ring-border"
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div>
          <p className="eyebrow mb-3">Quantity</p>
          <div className="flex items-center border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex size-10 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <Minus aria-hidden className="size-3.5" strokeWidth={1.5} />
            </button>
            <span aria-live="polite" className="w-10 text-center text-sm">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="flex size-10 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <Plus aria-hidden className="size-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div>
          <p className="eyebrow mb-3">Availability</p>
          <p
            className={cn(
              "flex items-center gap-2 text-sm",
              product.inStock ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                product.inStock ? "bg-whatsapp" : "bg-muted-foreground",
              )}
            />
            {product.inStock ? "In stock — ready to dispatch" : "Currently out of stock"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <WhatsAppButton product={product} color={color} quantity={quantity} size="brand" />
        <div className="flex items-center gap-3">
          <Button
            variant="line"
            size="brand"
            className="flex-1"
            aria-pressed={isWishlisted(product.id)}
            onClick={() => toggleWishlist(product)}
          >
            {isWishlisted(product.id) ? "Saved to wishlist" : "Add to wishlist"}
          </Button>
          <Button variant="line" size="brand" onClick={share} aria-label="Share this product">
            {shared ? <Check aria-hidden /> : <Share2 aria-hidden strokeWidth={1.5} />}
          </Button>
        </div>
      </div>

      <p className="flex items-center gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
        <Truck aria-hidden className="size-4 text-gold" strokeWidth={1.25} />
        Free insured shipping on orders above {formatPrice(2500)} · dispatched in 24–48 hours
      </p>
    </div>
  );
}
