import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-border bg-card px-6 py-20 text-center">
      <span className="mb-6 flex size-14 items-center justify-center rounded-full bg-sand text-gold">
        <Icon aria-hidden className="size-6" strokeWidth={1.25} />
      </span>
      <h3 className="font-serif text-2xl">{title}</h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}
