import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartOff } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { EmptyState } from "@/components/site/EmptyState";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — Velora" },
      {
        name: "description",
        content: "The Velora pieces you've saved, kept on this device and ready to order anytime.",
      },
      { property: "og:title", content: "Your Wishlist — Velora" },
      { property: "og:description", content: "Saved jewelry pieces, ready when you are." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, clearWishlist, products } = useStore();
  const saved = products.filter((p) => wishlist.includes(p.id));


  return (
    <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <header className="mt-8 mb-12 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <p className="eyebrow">Saved For Later</p>
          <h1 className="display-xl mt-5 text-3xl text-balance sm:text-4xl lg:text-5xl">
            Your Wishlist
          </h1>
          <p className="mt-5 text-sm text-muted-foreground">
            {wishlist.length
              ? `${wishlist.length} piece${wishlist.length === 1 ? "" : "s"} saved on this device.`
              : "Nothing saved yet."}
          </p>
        </div>
        {wishlist.length ? (
          <Button variant="quiet" size="brandSm" onClick={clearWishlist} className="shrink-0">
            Clear all
          </Button>
        ) : null}
      </header>

      {saved.length ? (
        <ProductGrid products={saved} />
      ) : (
        <EmptyState
          icon={HeartOff}
          title="Your wishlist is empty"
          description="Tap the heart on any piece to keep it here while you decide."
          action={
            <Button asChild variant="ink" size="brand">
              <Link to="/shop">Browse the collection</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
