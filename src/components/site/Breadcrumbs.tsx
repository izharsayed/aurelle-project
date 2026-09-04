import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.7rem] tracking-[0.16em] uppercase text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <Link to="/" className="link-underline hover:text-foreground">
            Home
          </Link>
          <ChevronRight aria-hidden className="size-3 opacity-50" />
        </li>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.to && !last ? (
                <Link to={item.to} className="link-underline hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="text-foreground">
                  {item.label}
                </span>
              )}
              {!last ? <ChevronRight aria-hidden className="size-3 opacity-50" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
