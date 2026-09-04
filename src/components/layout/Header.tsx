import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, Heart, MessageCircle, Search } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { AnimatedHamburger } from "./AnimatedHamburger";
import { CategoryDropdown } from "./CategoryDropdown";
import { Logo } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useStore } from "@/context/store-context";
import { cn } from "@/lib/utils";

export const navLinks = [
  { label: "Shop", to: "/shop", hasDropdown: true },
  { label: "Collections", to: "/collections" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Our Story", to: "/about" },
] as const;

export function Header() {
  const { setSearchOpen, wishlist } = useStore();
  const location = useLocation();
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      window.clearTimeout(dropdownTimeoutRef.current);
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = window.setTimeout(() => {
      setDropdownOpen(false);
    }, 180);
  };

  const iconClass =
    "flex size-9 cursor-pointer items-center justify-center rounded-full text-foreground transition-all duration-200 hover:text-gold hover:bg-muted/40 active:scale-95";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        compact
          ? "border-b border-border/80 bg-background/92 shadow-soft backdrop-blur-md"
          : "border-b border-transparent bg-background/98",
      )}
    >
      {/* Top Luxury Announcement Bar */}
      <div className="bg-ink py-2 text-center text-[0.62rem] tracking-[0.24em] uppercase text-ink-foreground/85 font-medium border-b border-gold/15">
        <div className="mx-auto flex max-w-[90rem] items-center justify-center gap-4 px-4">
          <span>Complimentary shipping on orders above ₹2,500</span>
          <span className="hidden md:inline text-gold">•</span>
          <span className="hidden md:inline">WhatsApp Concierge Available</span>
        </div>
      </div>

      {/* Haute Joaillerie 3-Column Header Grid */}
      <div
        className={cn(
          "mx-auto max-w-[90rem] px-4 sm:px-8 transition-all duration-300",
          compact ? "py-2.5 sm:py-3" : "py-4 sm:py-5",
        )}
      >
        <div className="grid grid-cols-3 items-center">
          {/* LEFT COLUMN: Desktop Primary Navigation / Mobile Menu Trigger */}
          <div className="flex items-center">
            {/* Mobile Controls */}
            <div className="flex items-center gap-1 lg:hidden">
              <AnimatedHamburger
                isOpen={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
                className={iconClass}
              />
              <button
                type="button"
                className={iconClass}
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <Search aria-hidden className="size-4.5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-7">
                {navLinks.map((link) => {
                  const isActive =
                    link.to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(link.to);

                  if (link.hasDropdown) {
                    return (
                      <li
                        key={link.to}
                        className="relative"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          to={link.to}
                          className={cn(
                            "group inline-flex items-center gap-1 py-2 text-[0.72rem] tracking-[0.22em] uppercase font-medium transition-colors hover:text-gold",
                            isActive ? "text-foreground font-semibold" : "text-muted-foreground",
                          )}
                        >
                          <span>{link.label}</span>
                          <ChevronDown
                            className={cn(
                              "size-3 text-muted-foreground transition-transform duration-200 group-hover:text-gold",
                              dropdownOpen && "rotate-180 text-gold",
                            )}
                          />
                        </Link>

                        {/* Category Dropdown Menu */}
                        {dropdownOpen && <CategoryDropdown onClose={() => setDropdownOpen(false)} />}
                      </li>
                    );
                  }

                  return (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className={cn(
                          "relative py-2 text-[0.72rem] tracking-[0.22em] uppercase font-medium transition-colors hover:text-gold",
                          isActive ? "text-foreground font-semibold" : "text-muted-foreground",
                        )}
                      >
                        <span>{link.label}</span>
                        {isActive && (
                          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gold animate-in fade-in duration-300" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* CENTER COLUMN: Perfectly Centered Brand Logo */}
          <div className="flex justify-center items-center">
            <Logo />
          </div>

          {/* RIGHT COLUMN: Utility & Concierge Actions */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            {/* Desktop Search Button */}
            <button
              type="button"
              className={cn(iconClass, "hidden lg:flex")}
              aria-label="Search collection"
              onClick={() => setSearchOpen(true)}
            >
              <Search aria-hidden className="size-4.5" strokeWidth={1.5} />
            </button>

            {/* Wishlist Link with Live Counter */}
            <Link
              to="/wishlist"
              aria-label="View saved pieces"
              className={cn(iconClass, "relative")}
            >
              <Heart aria-hidden className="size-4.5" strokeWidth={1.5} />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[0.55rem] font-bold text-accent-foreground shadow-xs animate-in zoom-in-50">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Theme Toggle (Dark / Light) */}
            <ThemeToggle className={iconClass} />

            {/* WhatsApp Concierge Direct Link */}
            <Link
              to="/contact"
              aria-label="WhatsApp Concierge"
              className={cn(
                "hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-whatsapp hover:bg-whatsapp/10 transition-colors",
              )}
            >
              <MessageCircle aria-hidden className="size-4" strokeWidth={1.75} />
              <span className="hidden xl:inline text-[0.68rem] tracking-wider uppercase font-medium">
                Concierge
              </span>
            </Link>
          </div>
        </div>
      </div>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}
