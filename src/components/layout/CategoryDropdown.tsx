import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { categories, collections } from "@/data/categories";

interface CategoryDropdownProps {
  onClose?: () => void;
}

export function CategoryDropdown({ onClose }: CategoryDropdownProps) {
  return (
    <div
      role="menu"
      aria-label="Shop categories menu"
      className="absolute top-full left-0 mt-3 w-[56rem] -translate-x-12 rounded-b-lg border border-border/70 bg-card/98 p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 z-50"
    >
      <div className="grid grid-cols-[1.2fr_1.2fr_1.4fr] gap-8">
        {/* Column 1: Core Categories */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
            <span className="text-[0.68rem] tracking-[0.22em] uppercase font-semibold text-gold">
              Categories
            </span>
          </div>
          <ul className="space-y-2.5">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: cat.slug }}
                  onClick={onClose}
                  className="group/item flex items-center justify-between text-xs tracking-wider uppercase text-foreground/80 transition-colors hover:text-gold"
                >
                  <span className="font-light">{cat.name}</span>
                  <ChevronRight className="size-3 text-muted-foreground/40 opacity-0 -translate-x-1 transition-all group-hover/item:opacity-100 group-hover/item:translate-x-0 group-hover/item:text-gold" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-3 border-t border-border/50">
            <Link
              to="/shop"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gold hover:underline tracking-wider uppercase"
            >
              <span>Explore All Pieces</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Column 2: Signature Collections */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
            <span className="text-[0.68rem] tracking-[0.22em] uppercase font-semibold text-gold">
              Collections
            </span>
          </div>
          <ul className="space-y-2.5">
            {collections.map((coll) => (
              <li key={coll}>
                <Link
                  to="/collections"
                  onClick={onClose}
                  className="group/item flex items-center justify-between text-xs tracking-wider uppercase text-foreground/80 transition-colors hover:text-gold"
                >
                  <span className="font-light">{coll}</span>
                  <ChevronRight className="size-3 text-muted-foreground/40 opacity-0 -translate-x-1 transition-all group-hover/item:opacity-100 group-hover/item:translate-x-0 group-hover/item:text-gold" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-3 border-t border-border/50">
            <Link
              to="/new-arrivals"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gold hover:underline tracking-wider uppercase"
            >
              <Sparkles className="size-3" />
              <span>New Arrivals</span>
            </Link>
          </div>
        </div>

        {/* Column 3: Featured Spotlight Card */}
        <div className="flex flex-col justify-between rounded-md border border-border/60 bg-muted/20 p-4">
          <div>
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-sm bg-sand">
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
                alt="Heirloom Bridal Suite"
                className="size-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 rounded-xs bg-ink/90 px-2 py-0.5 text-[0.6rem] uppercase tracking-widest text-ink-foreground">
                Spotlight
              </span>
            </div>
            <h4 className="mt-3 font-serif text-base text-foreground font-normal">
              Heirloom Bridal Suite
            </h4>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              18K micro-plated bridal suites and matching kundan chandeliers.
            </p>
          </div>

          <Link
            to="/contact"
            onClick={onClose}
            className="mt-4 flex items-center gap-2 rounded-sm border border-whatsapp/30 bg-whatsapp/5 px-3 py-2 text-xs text-whatsapp hover:bg-whatsapp/10 transition-colors"
          >
            <MessageCircle className="size-4 shrink-0" />
            <span className="text-[0.68rem] tracking-wider uppercase font-medium">
              Request Custom Bridal Styling
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
