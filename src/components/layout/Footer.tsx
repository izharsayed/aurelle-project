import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { Logo } from "@/components/site/Logo";

const shopLinks = [
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Best Sellers", to: "/shop" },
  { label: "Collections", to: "/collections" },
  { label: "Shop All", to: "/shop" },
] as const;

const infoLinks = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Shipping", to: "/faq" },
  { label: "Returns", to: "/faq" },
  { label: "FAQ", to: "/faq" },
] as const;

const socials = [
  { label: "Instagram", Icon: Instagram },
  { label: "Facebook", Icon: Facebook },
  { label: "WhatsApp", Icon: MessageCircle },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Velora Fine Jewelry crafts timeless, hand-finished artificial jewelry — warmly plated,
              artisanally detailed, and designed to elevate every occasion.
            </p>
          </div>

          <nav aria-labelledby="footer-shop">
            <h2 id="footer-shop" className="eyebrow mb-5">
              Shop
            </h2>
            <ul className="flex flex-col gap-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-info">
            <h2 id="footer-info" className="eyebrow mb-5">
              Information
            </h2>
            <ul className="flex flex-col gap-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-5">Follow Us</h2>
            <ul className="flex flex-col gap-3">
              {socials.map(({ label, Icon }) => (
                <li key={label}>
                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon aria-hidden className="size-4 text-gold" strokeWidth={1.5} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Mon–Sat, 10am–7pm IST
              <br />
              concierge@velorajewelry.com
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Velora Fine Jewelry. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-6">
            <li>
              <Link to="/faq" className="link-underline hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/faq" className="link-underline hover:text-foreground">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/admin" className="link-underline text-gold hover:text-foreground">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
