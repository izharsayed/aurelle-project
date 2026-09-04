import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductBrowser } from "@/components/shop/ProductBrowser";
import { useStore } from "@/context/store-context";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — Velora Fine Jewelry" },
      {
        name: "description",
        content:
          "The latest hand-finished pieces to join the Velora collection — new earrings, necklaces, bangles and sets.",
      },
      { property: "og:title", content: "New Arrivals — Velora Fine Jewelry" },
      {
        property: "og:description",
        content: "Fresh gold-plated earrings, necklaces and sets, just added.",
      },
    ],
  }),
  component: NewArrivalsPage,
});

function NewArrivalsPage() {
  const { products } = useStore();
  const items = products.filter((p) => p.newArrival);


  return (
    <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "New Arrivals" }]} />
      <header className="mt-8 mb-12 max-w-2xl">
        <p className="eyebrow">Just In</p>
        <h1 className="display-xl mt-5 text-3xl text-balance sm:text-4xl lg:text-5xl">
          New Arrivals
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {items.length} pieces added to the collection this season, from quiet everyday gold to
          full bridal suites.
        </p>
      </header>
      <ProductBrowser products={items} />
    </div>
  );
}
