import { Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "@/context/store-context";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 2500;

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
  } = useStore();

  // Close drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cartOpen) {
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cartOpen, setCartOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  if (!cartOpen) return null;

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const progressPercent = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-border/80 bg-background shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-4.5 text-gold" strokeWidth={1.5} />
              <h2 className="font-serif text-xl tracking-wide text-foreground">
                Shopping Bag
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                ({cartCount})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close bag"
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Complimentary Shipping Progress Banner */}
          <div className="bg-muted/40 px-5 py-3 border-b border-border/40 sm:px-6">
            <div className="flex justify-between text-[0.7rem] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
              <span>
                {amountToFreeShipping > 0 ? (
                  <>Add <strong className="text-gold font-semibold">{formatPrice(amountToFreeShipping)}</strong> for complimentary delivery</>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">✓ You qualify for complimentary luxury delivery</span>
                )}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1 w-full bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 divide-y divide-border/40">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="size-16 rounded-full bg-muted/60 flex items-center justify-center mb-4 text-muted-foreground">
                  <ShoppingBag className="size-7" strokeWidth={1.25} />
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-2">Your bag is empty</h3>
                <p className="text-xs text-muted-foreground max-w-xs mb-6">
                  Discover our handcrafted 18K anti-tarnish jewelry collections from Jaipur.
                </p>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setCartOpen(false)}
                  asChild
                >
                  <Link to="/shop">Explore Collection</Link>
                </Button>
              </div>
            ) : (
              cart.map((item) => {
                const unitPrice = item.salePrice ?? item.price;
                return (
                  <div key={`${item.productId}-${item.color}`} className="py-4 flex gap-4">
                    {/* Item Thumbnail */}
                    <div className="size-20 shrink-0 overflow-hidden rounded-xs border border-border/60 bg-muted/20">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted/40" />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            to="/product/$slug"
                            params={{ slug: item.slug }}
                            onClick={() => setCartOpen(false)}
                            className="font-serif text-base text-foreground hover:text-gold transition-colors truncate block"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId, item.color)}
                            className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="size-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                        {item.color && (
                          <p className="text-[0.68rem] tracking-wider uppercase text-muted-foreground mt-0.5">
                            Finish: {item.color}
                          </p>
                        )}
                      </div>

                      {/* Quantity Stepper and Subtotal */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border/80 rounded-xs">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(item.productId, item.color, item.quantity - 1)
                            }
                            className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" strokeWidth={1.5} />
                          </button>
                          <span className="w-7 text-center font-mono text-xs text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(item.productId, item.color, item.quantity + 1)
                            }
                            className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-medium text-foreground">
                            {formatPrice(unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="border-t border-border/80 bg-background/95 p-5 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Estimated Delivery</span>
                  <span>{amountToFreeShipping === 0 ? "Complimentary" : formatPrice(150)}</span>
                </div>
                <div className="flex justify-between text-base font-medium text-foreground pt-2 border-t border-border/60">
                  <span className="font-serif">Estimated Total</span>
                  <span className="text-gold font-semibold">
                    {formatPrice(cartTotal + (amountToFreeShipping === 0 ? 0 : 150))}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  variant="gold"
                  size="brand"
                  className="w-full flex items-center justify-center gap-2 group text-xs uppercase tracking-widest font-semibold"
                  onClick={() => setCartOpen(false)}
                  asChild
                >
                  <Link to="/checkout">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  onClick={() => setCartOpen(false)}
                  asChild
                >
                  <Link to="/cart">View Detailed Bag</Link>
                </Button>
              </div>

              <p className="text-[0.65rem] text-center text-muted-foreground uppercase tracking-widest">
                🔒 Secure 256-bit Encrypted Checkout with Cashfree
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
