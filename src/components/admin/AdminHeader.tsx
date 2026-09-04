import { Link } from "@tanstack/react-router";
import { ExternalLink, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/site/ThemeToggle";

interface AdminHeaderProps {
  productCount: number;
  inquiryCount: number;
  onLogout: () => void;
}

export function AdminHeader({ productCount, inquiryCount, onLogout }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl font-normal tracking-wide text-foreground">
              Velora
            </span>
            <span className="rounded bg-accent/15 px-2 py-0.5 font-sans text-xs font-medium tracking-wider uppercase text-accent">
              Admin
            </span>
          </Link>

          <div className="hidden items-center gap-2 sm:flex ml-4">
            <Badge variant="outline" className="border-border text-muted-foreground gap-1.5 font-normal">
              <Sparkles className="size-3 text-gold" />
              {productCount} Products
            </Badge>
            {inquiryCount > 0 && (
              <Badge variant="secondary" className="bg-whatsapp/10 text-whatsapp gap-1 font-medium">
                {inquiryCount} New Leads
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs font-medium">
            <Link to="/" target="_blank">
              View Storefront <ExternalLink className="size-3.5 text-muted-foreground" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-destructive gap-1.5 text-xs font-medium"
            title="Lock session"
          >
            <Lock className="size-3.5" />
            <span>Lock</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
