import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { Stars } from "@/components/site/Stars";
import { WishlistButton } from "./WishlistButton";
import { ProductBadge } from "./ProductBadge";
import { useStore } from "@/context/store-context";
import { discountPercent, formatPrice } from "@/lib/format";

export function QuickViewModal() {
  const { quickView, setQuickView } = useStore();
  const product = quickView;

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && setQuickView(null)}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-none border-border bg-card p-0 sm:rounded-none">
        {product ? (
          <div className="grid max-h-[85vh] overflow-y-auto sm:grid-cols-2 sm:overflow-visible">
            <div className="relative bg-sand">
              <img
                src={product.images[0]}
                alt={product.name}
                width={800}
                height={1000}
                className="aspect-4/5 size-full object-cover"
              />
              {product.salePrice ? (
                <div className="absolute top-4 left-4">
                  <ProductBadge tone="sale">
                    {`${discountPercent(product.price, product.salePrice)}% off`}
                  </ProductBadge>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 p-6 sm:p-8">
              <p className="eyebrow">{product.collection}</p>
              <DialogTitle className="font-serif text-2xl leading-tight font-light sm:text-3xl">
                {product.name}
              </DialogTitle>
              <div className="flex items-center gap-3">
                <Stars rating={product.rating} />
                <span className="text-xs text-muted-foreground">{product.reviewCount} reviews</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-lg">{formatPrice(product.salePrice ?? product.price)}</span>
                {product.salePrice ? (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                ) : null}
              </div>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {product.longDescription}
              </DialogDescription>

              <dl className="grid grid-cols-2 gap-3 border-y border-border py-4 text-xs">
                <div>
                  <dt className="eyebrow">SKU</dt>
                  <dd className="mt-1">{product.sku}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Availability</dt>
                  <dd className="mt-1">{product.inStock ? "In stock" : "Out of stock"}</dd>
                </div>
              </dl>

              <div className="mt-auto flex flex-col gap-3">
                <WhatsAppButton product={product} color={product.colors[0]?.name} size="brand" />
                <div className="flex items-center gap-3">
                  <Button asChild variant="line" size="brandSm" className="flex-1">
                    <Link
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      onClick={() => setQuickView(null)}
                    >
                      View details
                    </Link>
                  </Button>
                  <WishlistButton product={product} tone="bare" className="border border-border" />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
