import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductBrowser } from "@/components/shop/ProductBrowser";
import { useStore } from "@/context/store-context";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All Jewelry — Velora Fine Jewelry" },
      {
        name: "description",
        content:
          "Browse all Velora pieces. Filter by category, price, colour and occasion, then order the ones you love over WhatsApp.",
      },
      { property: "og:title", content: "Shop All Jewelry — Velora Fine Jewelry" },
      {
        property: "og:description",
        content:
          "Filter earrings, necklaces, bangles, rings and bridal sets by price and occasion.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { products } = useStore();

  return (
    <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <header className="mt-8 mb-12 max-w-2xl">
        <p className="eyebrow">All Jewelry</p>
        <h1 className="display-xl mt-5 text-3xl text-balance sm:text-4xl lg:text-5xl">
          The Full Collection
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-foreground/80 sm:text-base font-normal">
          Hand-finished pieces across earrings, necklaces, bracelets, bangles, rings and
          bridal sets. Use the filters to narrow it down.
        </p>
      </header>
      <ProductBrowser products={products} />
    </div>
  );
}

