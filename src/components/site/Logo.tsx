import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  return (
    <Link
      to="/"
      aria-label="Velora Fine Jewelry — home"
      className={cn(
        "font-serif text-2xl leading-none tracking-[0.24em] uppercase transition-colors sm:text-[1.65rem] font-medium",
        tone === "light" ? "text-card hover:text-gold-light" : "text-foreground hover:text-gold",
        className,
      )}
    >
      Velora
    </Link>
  );
}
