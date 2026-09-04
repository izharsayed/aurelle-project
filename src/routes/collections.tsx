import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { occasions } from "@/data/categories";
import { useStore } from "@/context/store-context";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections & Occasions — Velora" },
      {
        name: "description",
        content:
          "Curated jewelry edits for weddings, festive season, parties, everyday wear and gifting — styled and ready to order.",
      },
      { property: "og:title", content: "Collections & Occasions — Velora" },
      {
        property: "og:description",
        content: "Bridal, festive, party, everyday and gifting edits from Velora.",
      },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { products } = useStore();

  return (
    <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Collections" }]} />
      <header className="mt-8 mb-14 max-w-2xl">
        <p className="eyebrow">Curated Edits</p>
        <h1 className="display-xl mt-5 text-3xl text-balance sm:text-4xl lg:text-5xl">
          Shop By Occasion
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Five edits pulled from the full collection, so you can start from the moment rather than
          the metal.
        </p>
      </header>

      <div className="flex flex-col gap-24">
        {occasions.map((occasion) => {
          const items = products.filter((p) => p.occasions.includes(occasion.slug)).slice(0, 4);
          return (
            <section key={occasion.slug} aria-labelledby={`oc-${occasion.slug}`}>
              <div className="relative isolate mb-10 overflow-hidden bg-sand">
                <img
                  src={occasion.image}
                  alt=""
                  width={1600}
                  height={500}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
                <div aria-hidden className="absolute inset-0 bg-ink/50" />
                <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 p-7 text-ink-foreground sm:p-12">
                  <div className="min-w-0">
                    <p className="eyebrow text-gold-light">{occasion.tagline}</p>
                    <h2 id={`oc-${occasion.slug}`} className="display-xl mt-4 text-2xl sm:text-4xl">
                      {occasion.name}
                    </h2>
                  </div>
                  <Link
                    to="/shop"
                    className="link-underline shrink-0 text-[0.65rem] tracking-[0.2em] uppercase text-gold-light"
                  >
                    Shop all
                  </Link>
                </div>
              </div>
              <ProductGrid products={items} />
            </section>
          );
        })}
      </div>

      <section className="mt-24">
        <SectionHeading
          eyebrow="Not Sure Where To Start?"
          title="We'll Help You Choose"
          description="Message our team on WhatsApp with the outfit or occasion and we'll send back three options."
        />
      </section>
    </div>
  );
}
