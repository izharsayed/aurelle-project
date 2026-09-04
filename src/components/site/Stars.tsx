import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating,
  className,
  size = "sm",
}: {
  rating: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const px = size === "md" ? "size-4" : "size-3.5";
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(px, i < Math.round(rating) ? "fill-gold text-gold" : "text-border")}
          strokeWidth={1.25}
        />
      ))}
    </span>
  );
}
