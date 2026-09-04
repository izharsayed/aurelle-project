import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/store-context";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "group relative flex size-9 cursor-pointer items-center justify-center rounded-sm transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-gold",
        className,
      )}
    >
      <div className="relative size-4.5 overflow-hidden">
        {/* Sun icon for Dark mode */}
        <Sun
          className={cn(
            "size-4.5 transition-all duration-300 transform",
            isDark
              ? "rotate-0 scale-100 opacity-100 text-gold"
              : "-rotate-90 scale-0 opacity-0 absolute inset-0",
          )}
          strokeWidth={1.5}
          aria-hidden
        />
        {/* Moon icon for Light mode */}
        <Moon
          className={cn(
            "size-4.5 transition-all duration-300 transform",
            !isDark
              ? "rotate-0 scale-100 opacity-100 text-foreground"
              : "rotate-90 scale-0 opacity-0 absolute inset-0",
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-medium uppercase tracking-wider">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
