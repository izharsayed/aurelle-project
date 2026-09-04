import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Gem, Heart, MessageCircle, Sparkles, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { categories, occasions } from "@/data/categories";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useStore } from "@/context/store-context";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const location = useLocation();
  const { wishlist } = useStore();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[88vw] max-w-sm overflow-y-auto bg-background p-0 border-r border-border/80 flex flex-col justify-between"
      >
        <div>
          {/* Luxury Drawer Header */}
          <SheetHeader className="p-5 border-b border-border/70 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-full bg-sand border border-border">
                <Gem className="size-4 text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <SheetTitle className="font-serif text-lg tracking-[0.24em] uppercase text-foreground font-light leading-none">
                  Velora
                </SheetTitle>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-gold font-medium mt-0.5">
                  Fine Jewelry
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle className="size-8.5 rounded-full hover:bg-muted/60 text-foreground" />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="flex size-8.5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground active:scale-95 cursor-pointer"
              >
                <X className="size-4.5" strokeWidth={1.5} />
              </button>
            </div>
          </SheetHeader>

          {/* Navigation Links */}
          <nav aria-label="Mobile Navigation" className="p-5 space-y-6">
            <ul className="space-y-1">
              {/* Home */}
              <li>
                <Link
                  to="/"
                  onClick={close}
                  className={cn(
                    "flex items-center justify-between py-2.5 font-serif text-xl tracking-wide transition-colors",
                    location.pathname === "/"
                      ? "text-gold font-medium"
                      : "text-foreground hover:text-gold",
                  )}
                >
                  <span>Home</span>
                  <ChevronRight className="size-4 text-muted-foreground/40" />
                </Link>
              </li>

              {/* Shop Collection with Expandable Categories */}
              <li className="border-y border-border/40 py-1">
                <div className="flex items-center justify-between">
                  <Link
                    to="/shop"
                    onClick={close}
                    className={cn(
                      "flex-1 py-2 font-serif text-xl tracking-wide transition-colors",
                      location.pathname.startsWith("/shop")
                        ? "text-gold font-medium"
                        : "text-foreground hover:text-gold",
                    )}
                  >
                    Shop All Pieces
                  </Link>
                  <button
                    type="button"
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                    aria-label="Expand categories"
                    className="flex size-9 items-center justify-center text-muted-foreground hover:text-gold cursor-pointer"
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform duration-300",
                        categoriesOpen && "rotate-180 text-gold",
                      )}
                    />
                  </button>
                </div>

                {/* Collapsible Category Grid */}
                {categoriesOpen && (
                  <div className="mt-2 mb-3 grid grid-cols-2 gap-2 pl-1 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        onClick={close}
                        className="flex items-center justify-between rounded-sm border border-border/60 bg-card/60 px-3 py-2 text-xs text-muted-foreground transition-all hover:border-gold/60 hover:text-gold"
                      >
                        <span>{c.name}</span>
                        <ChevronRight className="size-3 opacity-40" />
                      </Link>
                    ))}
                  </div>
                )}
              </li>

              {/* New Arrivals */}
              <li>
                <Link
                  to="/new-arrivals"
                  onClick={close}
                  className={cn(
                    "flex items-center justify-between py-2.5 font-serif text-xl tracking-wide transition-colors",
                    location.pathname.startsWith("/new-arrivals")
                      ? "text-gold font-medium"
                      : "text-foreground hover:text-gold",
                  )}
                >
                  <span className="flex items-center gap-2">
                    New Arrivals
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.6rem] font-sans font-semibold tracking-wider uppercase text-gold">
                      New
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground/40" />
                </Link>
              </li>

              {/* Collections */}
              <li>
                <Link
                  to="/collections"
                  onClick={close}
                  className={cn(
                    "flex items-center justify-between py-2.5 font-serif text-xl tracking-wide transition-colors",
                    location.pathname.startsWith("/collections")
                      ? "text-gold font-medium"
                      : "text-foreground hover:text-gold",
                  )}
                >
                  <span>Collections</span>
                  <ChevronRight className="size-4 text-muted-foreground/40" />
                </Link>
              </li>

              {/* Saved Pieces / Wishlist */}
              <li>
                <Link
                  to="/wishlist"
                  onClick={close}
                  className={cn(
                    "flex items-center justify-between py-2.5 font-serif text-xl tracking-wide transition-colors",
                    location.pathname.startsWith("/wishlist")
                      ? "text-gold font-medium"
                      : "text-foreground hover:text-gold",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Heart className="size-4.5 text-gold" />
                    Saved Pieces
                  </span>
                  {wishlist.length > 0 ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-gold text-[0.65rem] font-bold text-accent-foreground">
                      {wishlist.length}
                    </span>
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground/40" />
                  )}
                </Link>
              </li>

              {/* Story */}
              <li>
                <Link
                  to="/about"
                  onClick={close}
                  className={cn(
                    "flex items-center justify-between py-2.5 font-serif text-xl tracking-wide transition-colors",
                    location.pathname.startsWith("/about")
                      ? "text-gold font-medium"
                      : "text-foreground hover:text-gold",
                  )}
                >
                  <span>Our Story</span>
                  <ChevronRight className="size-4 text-muted-foreground/40" />
                </Link>
              </li>

              {/* FAQ */}
              <li>
                <Link
                  to="/faq"
                  onClick={close}
                  className={cn(
                    "flex items-center justify-between py-2.5 font-serif text-xl tracking-wide transition-colors",
                    location.pathname.startsWith("/faq")
                      ? "text-gold font-medium"
                      : "text-foreground hover:text-gold",
                  )}
                >
                  <span>Care & FAQ</span>
                  <ChevronRight className="size-4 text-muted-foreground/40" />
                </Link>
              </li>
            </ul>

            {/* Quick Occasion Pills */}
            <div className="pt-2 border-t border-border/50">
              <p className="eyebrow mb-2.5 text-[0.65rem]">Shop By Occasion</p>
              <div className="flex flex-wrap gap-1.5">
                {occasions.map((o) => (
                  <Link
                    key={o.slug}
                    to="/collections"
                    onClick={close}
                    className="inline-flex rounded-sm border border-border/80 bg-muted/20 px-2.5 py-1 text-[0.7rem] text-muted-foreground transition-colors hover:border-gold hover:text-foreground"
                  >
                    {o.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Concierge Card & Reassurance */}
        <div className="p-5 border-t border-border/70 bg-card/40 space-y-3">
          <div className="rounded-md border border-whatsapp/30 bg-whatsapp/5 p-3.5 flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp mt-0.5">
              <MessageCircle className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-foreground tracking-wide">
                WhatsApp Concierge
              </h4>
              <p className="text-[0.68rem] text-muted-foreground mt-0.5 leading-tight">
                Live styling advice, size assistance & real-time jewelry previews.
              </p>
              <Link
                to="/contact"
                onClick={close}
                className="mt-2.5 inline-flex items-center gap-1.5 text-[0.68rem] tracking-wider uppercase font-semibold text-whatsapp hover:underline"
              >
                <span>Connect with Concierge</span>
                <Sparkles className="size-3" />
              </Link>
            </div>
          </div>

          <p className="text-center text-[0.62rem] tracking-widest uppercase text-muted-foreground/70">
            Complimentary shipping on orders above ₹2,500
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
