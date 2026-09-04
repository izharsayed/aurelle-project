import { cn } from "@/lib/utils";

interface AnimatedHamburgerProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  "aria-label"?: string;
}

export function AnimatedHamburger({
  isOpen,
  onClick,
  className,
  "aria-label": ariaLabel = "Toggle navigation menu",
}: AnimatedHamburgerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      className={cn(
        "group relative flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted/50 active:scale-95 focus:outline-hidden",
        className,
      )}
    >
      <div className="relative flex size-5 flex-col items-center justify-center">
        {/* Top bar */}
        <span
          className={cn(
            "absolute h-[1.5px] w-5 rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isOpen
              ? "top-[9px] rotate-45 bg-gold"
              : "top-[3px] group-hover:bg-gold group-hover:w-5",
          )}
        />

        {/* Middle bar */}
        <span
          className={cn(
            "absolute top-[9px] h-[1.5px] rounded-full bg-foreground transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isOpen
              ? "w-0 opacity-0 -translate-x-2"
              : "w-4 left-0.5 opacity-100 group-hover:w-5 group-hover:bg-gold",
          )}
        />

        {/* Bottom bar */}
        <span
          className={cn(
            "absolute h-[1.5px] rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isOpen
              ? "bottom-[9px] w-5 -rotate-45 bg-gold"
              : "bottom-[3px] w-3.5 left-0.5 group-hover:w-5 group-hover:bg-gold",
          )}
        />
      </div>
    </button>
  );
}
