import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Your Shopping Bag — Velora Fine Jewelry" }],
  }),
  component: CartPage,
});

const FREE_SHIPPING_THRESHOLD = 2500;

function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useStore();

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const shippingFee = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 150;
  const grandTotal = cartTotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
          <ShoppingBag className="size-8 text-gold" strokeWidth={1.25} />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-3">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
          Explore our signature collections of 18K gold-plated anti-tarnish jewelry and Jaipur heirloom bridal sets.
        </p>
        <Button variant="gold" size="brand" asChild>
          <Link to="/shop">Discover Collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between border-b border-border/80 pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-light">Shopping Bag</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            {cartCount} {cartCount === 1 ? "Piece" : "Pieces"} Selected
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors text-left"
        >
          Clear entire bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Items List */}
        <div className="lg:col-span-8 divide-y divide-border/60">
          {cart.map((item) => {
            const unitPrice = item.salePrice ?? item.price;
            return (
              <div key={`${item.productId}-${item.color}`} className="py-6 flex gap-6">
                <div className="size-24 sm:size-28 shrink-0 overflow-hidden rounded-xs border border-border/60 bg-muted/20">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link
                          to="/product/$slug"
                          params={{ slug: item.slug }}
                          className="font-serif text-lg sm:text-xl text-foreground hover:text-gold transition-colors block"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          SKU: <span className="font-mono">{item.sku}</span>
                          {item.color && (
                            <span className="ml-3 uppercase tracking-wider">Finish: {item.color}</span>
                          )}
                        </p>
                      </div>

                      <span className="text-base font-medium text-foreground">
                        {formatPrice(unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-border rounded-xs">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(item.productId, item.color, item.quantity - 1)
                        }
                        className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" strokeWidth={1.5} />
                      </button>
                      <span className="w-8 text-center font-mono text-xs text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(item.productId, item.color, item.quantity + 1)
                        }
                        className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" strokeWidth={1.5} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId, item.color)}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Summary Box */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-xs border border-border/80 bg-card p-6 shadow-xs space-y-6">
            <h2 className="font-serif text-xl tracking-wide text-foreground border-b border-border/60 pb-3">
              Order Summary
            </h2>

            {/* Free Shipping Alert */}
            <div className="rounded-xs bg-muted/40 p-3 text-xs text-muted-foreground">
              {amountToFreeShipping > 0 ? (
                <p>
                  Add <strong className="text-gold font-semibold">{formatPrice(amountToFreeShipping)}</strong> more to unlock <strong className="text-foreground">complimentary insured shipping</strong>.
                </p>
              ) : (
                <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                  ✓ You've unlocked complimentary insured shipping!
                </p>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Pieces Subtotal</span>
                <span className="text-foreground font-medium">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Insured Express Shipping</span>
                <span className="text-foreground">
                  {shippingFee === 0 ? "Complimentary" : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Luxury Velvet Packaging</span>
                <span className="text-emerald-700 dark:text-emerald-400">Included</span>
              </div>

              <div className="border-t border-border/80 pt-4 flex justify-between text-lg font-medium text-foreground">
                <span className="font-serif">Grand Total</span>
                <span className="text-gold font-semibold">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Button
              variant="gold"
              size="brand"
              className="w-full flex items-center justify-center gap-2 group text-xs uppercase tracking-widest font-semibold"
              asChild
            >
              <Link to="/checkout">
                <span>Proceed to Checkout</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <div className="text-center pt-2 space-y-1">
              <p className="text-[0.68rem] text-muted-foreground uppercase tracking-widest">
                🛡️ Guaranteed Anti-Tarnish Quality • 100% Hypoallergenic
              </p>
              <p className="text-[0.65rem] text-muted-foreground">
                Payments processed securely via Cashfree (UPI, Cards, NetBanking)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
