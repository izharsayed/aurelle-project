import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  action,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        centered
          ? "items-center text-center"
          : "items-start gap-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("min-w-0", centered && "flex flex-col items-center")}>
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h2 className="display-xl text-3xl text-balance sm:text-4xl lg:text-[2.85rem]">{title}</h2>
        {description ? (
          <p
            className={cn(
              "mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base",
              centered && "text-center",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
