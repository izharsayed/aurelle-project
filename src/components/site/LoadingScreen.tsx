import { Gem, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = "Curating timeless pieces...",
  className,
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-label="Loading Velora Fine Jewelry"
      className={cn(
        "relative flex flex-col items-center justify-center bg-background px-6 transition-colors duration-500 overflow-hidden",
        fullScreen ? "fixed inset-0 z-100 min-h-screen" : "min-h-[60vh] w-full py-16",
        className,
      )}
    >
      {/* Ambient background soft luxury glow */}
      <div
        className="pointer-events-none absolute size-96 rounded-full bg-gold/10 blur-3xl -translate-y-10"
        aria-hidden
      />

      {/* Central Brand Emblem with spinning ring */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Subtle rotating outer gold ring */}
        <div
          className="absolute size-20 rounded-full border border-gold/30 border-t-gold animate-spin"
          style={{ animationDuration: "2.5s" }}
        />
        {/* Counter-rotating dashed gold ring */}
        <div
          className="absolute size-24 rounded-full border border-dashed border-gold/20 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "8s" }}
        />

        {/* Center Gem emblem */}
        <div className="flex size-14 items-center justify-center rounded-full bg-card shadow-soft border border-border">
          <Gem className="size-6 text-gold animate-pulse" strokeWidth={1.25} />
        </div>
      </div>

      {/* Brand Title with editorial spacing */}
      <div className="text-center space-y-2">
        <h2 className="font-serif text-3xl sm:text-4xl tracking-[0.3em] uppercase text-foreground font-light">
          Velora
        </h2>
        <p className="text-[0.65rem] sm:text-xs tracking-[0.25em] uppercase text-gold font-medium">
          Fine Jewelry
        </p>
      </div>

      {/* Hairline progress track */}
      <div className="mt-8 w-48 max-w-xs h-0.5 bg-border rounded-full overflow-hidden relative">
        <div
          className="absolute inset-y-0 h-full w-24 bg-gradient-to-r from-transparent via-gold to-transparent animate-[shimmer_1.6s_infinite]"
          style={{
            animation: "shimmer 1.8s infinite ease-in-out",
          }}
        />
      </div>

      {/* Atmospheric loading message */}
      <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground font-light">
        <Sparkles className="size-3 text-gold/80 animate-spin" style={{ animationDuration: "3s" }} />
        <span>{message}</span>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
