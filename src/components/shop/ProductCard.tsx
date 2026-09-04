import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Expand, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { ProductBadge } from "./ProductBadge";
import { WishlistButton } from "./WishlistButton";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { Stars } from "@/components/site/Stars";
import { useStore } from "@/context/store-context";
import type { Product } from "@/data/types";
import { discountPercent, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list" | undefined;
  priority?: boolean | undefined;
}

function Badges({ product }: { product: Product }) {
  return (
    <div className="pointer-events-none absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col items-start gap-1 z-10">
      {!product.inStock && <ProductBadge tone="soon">Out of stock</ProductBadge>}
      {product.salePrice && (
        <ProductBadge tone="sale">{`${discountPercent(product.price, product.salePrice)}% off`}</ProductBadge>
      )}
      {product.newArrival && product.inStock && <ProductBadge tone="new">New</ProductBadge>}
      {product.bestSeller && !product.newArrival && (
        <ProductBadge tone="best">Bestseller</ProductBadge>
      )}
    </div>
  );
}

export function ProductCard({ product, layout = "grid", priority = false }: ProductCardProps) {
  const { setQuickView, requestOrder } = useStore();
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : "Standard",
  );

  const isList = layout === "list";
  const hasMultipleImages = product.images && product.images.length > 1;
  const primaryImage = product.images[0];
  const secondaryImage = hasMultipleImages ? product.images[1] : primaryImage;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex h-full bg-card transition-all duration-300 hover:shadow-soft",
        isList
          ? "flex-col gap-5 border border-border p-4 sm:flex-row sm:p-5"
          : "flex-col justify-between border border-border/60 p-2 sm:p-3.5",
      )}
    >
      {/* Media Container */}
      <div
        className={cn(
          "relative overflow-hidden bg-sand",
          isList ? "w-full shrink-0 sm:w-60" : "w-full",
        )}
      >
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="block"
          tabIndex={-1}
          aria-hidden
        >
          <div className="relative aspect-4/5 w-full overflow-hidden">
            <img
              src={primaryImage}
              alt={product.name}
              width={800}
              height={1000}
              loading={priority ? "eager" : "lazy"}
              className={cn(
                "absolute inset-0 size-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                hasMultipleImages
                  ? "group-hover:scale-105 group-hover:opacity-0"
                  : "group-hover:scale-105",
              )}
            />

            {hasMultipleImages && (
              <img
                src={secondaryImage}
                alt={`${product.name} angle view`}
                width={800}
                height={1000}
                loading="lazy"
                aria-hidden
                className="absolute inset-0 size-full scale-105 object-cover opacity-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100"
              />
            )}
          </div>
        </Link>

        <Badges product={product} />
        <WishlistButton
          product={product}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 size-8 sm:size-9"
        />

        {/* Desktop Quick View Overlay */}
        {!isList && (
          <div className="absolute inset-x-0 bottom-0 hidden translate-y-3 p-3 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 sm:block z-10">
            <button
              type="button"
              onClick={() => setQuickView(product)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 bg-card/95 py-2.5 text-[0.65rem] tracking-[0.2em] uppercase backdrop-blur-[2px] transition-colors hover:bg-ink hover:text-ink-foreground shadow-sm"
            >
              <Expand aria-hidden className="size-3.5" strokeWidth={1.5} /> Quick view
            </button>
          </div>
        )}
      </div>

      {/* Content & Details */}
      <div className={cn("flex flex-1 flex-col justify-between", isList ? "gap-3" : "pt-2.5 sm:pt-3")}>
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 font-serif text-sm sm:text-base lg:text-lg leading-snug line-clamp-2 min-h-[2.4rem] sm:min-h-0">
              <Link to="/product/$slug" params={{ slug: product.slug }} className="link-underline">
                {product.name}
              </Link>
            </h3>
            {isList && <Stars rating={product.rating} className="mt-1 shrink-0" />}
          </div>

          {/* Hide verbose description on mobile 2-col to keep grid heights crisp */}
          <p
            className={cn(
              "text-xs leading-relaxed text-muted-foreground mt-1",
              isList ? "max-w-prose block" : "hidden sm:block sm:line-clamp-1",
            )}
          >
            {isList ? product.longDescription : product.description}
          </p>

          {/* Pricing */}
          <div className="mt-1 sm:mt-1.5 flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-semibold tracking-wide text-foreground">
              {formatPrice(product.salePrice ?? product.price)}
            </span>
            {product.salePrice && (
              <span className="text-[11px] sm:text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Finish / Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedColor(c.name);
                      }}
                      title={c.name}
                      className={cn(
                        "size-3.5 sm:size-4 rounded-full border transition-all duration-200 cursor-pointer",
                        isSelected
                          ? "ring-2 ring-gold ring-offset-1 scale-110 border-transparent shadow-xs"
                          : "border-border/80 hover:scale-110 opacity-75 hover:opacity-100",
                      )}
                      style={{ backgroundColor: c.hex }}
                      aria-label={`Select ${c.name} finish`}
                    />
                  );
                })}
              </div>
              <span className="hidden sm:inline text-[11px] text-muted-foreground capitalize truncate">
                {selectedColor}
              </span>
            </div>
          )}
        </div>

        {/* Action Row */}
        {isList ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <WhatsAppButton product={product} color={selectedColor} className="sm:w-auto sm:px-6" />
            <button
              type="button"
              onClick={() => setQuickView(product)}
              className="cursor-pointer text-[0.68rem] tracking-[0.18em] uppercase text-muted-foreground transition-colors hover:text-gold px-3"
            >
              Quick view
            </button>
          </div>
        ) : (
          <div className="mt-3 pt-2 sm:pt-3 border-t border-border/50 flex items-center gap-1.5">
            {/* Minimalist luxury WhatsApp button */}
            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => requestOrder({ product, color: selectedColor, quantity: 1 })}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-sm py-2 px-2 text-[0.65rem] sm:text-xs tracking-wider uppercase font-medium transition-all cursor-pointer",
                product.inStock
                  ? "bg-whatsapp text-white hover:bg-whatsapp/90 active:scale-[0.98] shadow-xs"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              <MessageCircle className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span>{product.inStock ? "Order" : "Out of Stock"}</span>
            </button>

            {/* Mobile Quick View icon button */}
            <button
              type="button"
              onClick={() => setQuickView(product)}
              aria-label="Quick view"
              title="Quick view"
              className="flex size-8.5 shrink-0 items-center justify-center rounded-sm border border-border bg-card text-muted-foreground transition-colors hover:border-gold hover:text-foreground active:scale-95 sm:hidden cursor-pointer"
            >
              <Expand className="size-3.5" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
