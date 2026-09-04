import { useEffect, useState } from "react";
import { Gem, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PagePreloaderProps {
  /** Minimum duration in ms to show the loading animation before fading out */
  minDuration?: number;
}

export function PagePreloader({ minDuration = 850 }: PagePreloaderProps) {
  const [mounted, setMounted] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fading out after minDuration
    const fadeTimer = window.setTimeout(() => {
      setIsFading(true);
    }, minDuration);

    // Completely unmount after fade animation completes (700ms)
    const unmountTimer = window.setTimeout(() => {
      setMounted(false);
    }, minDuration + 700);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [minDuration]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden={isFading}
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isFading ? "opacity-0 pointer-events-none scale-[1.02] blur-[1px]" : "opacity-100",
      )}
    >
      {/* Ambient luxury gold glow */}
      <div
        className="pointer-events-none absolute size-96 rounded-full bg-gold/15 blur-3xl -translate-y-8 animate-pulse"
        style={{ animationDuration: "3s" }}
        aria-hidden
      />

      {/* Central Brand Emblem with Dual Gold Orbit Rings */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer continuous spinning gold ring */}
        <div
          className="absolute size-24 rounded-full border border-gold/30 border-t-gold animate-spin"
          style={{ animationDuration: "2.4s" }}
        />
        {/* Counter-rotating dashed gold ring */}
        <div
          className="absolute size-28 rounded-full border border-dashed border-gold/20 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "7s" }}
        />

        {/* Center Gem medallion */}
        <div className="flex size-16 items-center justify-center rounded-full bg-card shadow-soft border border-border/80">
          <Gem className="size-7 text-gold animate-pulse" strokeWidth={1.25} />
        </div>
      </div>

      {/* Brand Name & Tagline */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl tracking-[0.32em] uppercase text-foreground font-light">
          Velora
        </h1>
        <p className="text-[0.65rem] sm:text-xs tracking-[0.28em] uppercase text-gold font-medium">
          Fine Jewelry
        </p>
      </div>

      {/* Hairline Gold Progress Bar with Shimmer */}
      <div className="mt-8 w-44 max-w-xs h-0.5 bg-border/80 rounded-full overflow-hidden relative">
        <div
          className="absolute inset-y-0 h-full w-24 bg-gradient-to-r from-transparent via-gold to-transparent"
          style={{
            animation: "veloraShimmer 1.5s infinite ease-in-out",
          }}
        />
      </div>

      {/* Atmospheric Subtitle */}
      <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground font-light tracking-wide">
        <Sparkles className="size-3 text-gold/80 animate-spin" style={{ animationDuration: "2.5s" }} />
        <span>Hand-finishing the collection...</span>
      </div>

      <style>{`
        @keyframes veloraShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
