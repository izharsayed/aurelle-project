import { cn } from "@/lib/utils";

type Tone = "sale" | "new" | "best" | "soon" | "featured";

const tones: Record<Tone, string> = {
  sale: "bg-ink text-ink-foreground",
  new: "bg-card text-foreground border border-border",
  best: "bg-gold-light text-ink",
  soon: "bg-card/95 text-muted-foreground border border-border",
  featured: "bg-gold text-accent-foreground",
};

export function ProductBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: string;
  className?: string | undefined;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[0.6rem] font-medium tracking-[0.2em] uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
