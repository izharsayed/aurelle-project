import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gem, Instagram, PackageCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Newsletter } from "@/components/site/Newsletter";
import { TestimonialCard } from "@/components/site/ReviewCards";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { categories, occasions } from "@/data/categories";
import { getBestSellers, getNewArrivals, galleryImages } from "@/data/products";
import { img } from "@/data/images";
import { testimonials } from "@/data/testimonials";

import { useStore } from "@/context/store-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Velora Fine Jewelry — Handcrafted Luxury & Elegance" },
      {
        name: "description",
        content:
          "Elegant artificial jewelry for weddings, festivals and every day. Explore earrings, necklaces, bangles and bridal sets — order in minutes on WhatsApp.",
      },
      { property: "og:title", content: "Velora Fine Jewelry" },
      {
        property: "og:description",
        content:
          "Hand-finished earrings, necklaces, bangles and bridal sets in warm 18K gold plating.",
      },
    ],
  }),
  component: HomePage,
});

const promises = [
  {
    Icon: Gem,
    title: "Hand-Finished Quality",
    body: "Every piece is polished, set and checked by hand before it is boxed.",
  },
  {
    Icon: Sparkles,
    title: "18K Gold Plating",
    body: "Sealed with an anti-tarnish coat that holds its tone for 12–18 months.",
  },
  {
    Icon: Truck,
    title: "Insured Shipping",
    body: "Dispatched in 24–48 hours with tracking, complimentary above ₹2,500.",
  },
  {
    Icon: PackageCheck,
    title: "7-Day Returns",
    body: "Unworn and unhappy? Send it back within a week, no questions asked.",
  },
];

function HomePage() {
  const { products } = useStore();
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 8);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);


  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-sand">
        <img
          src={img.hero}
          alt="Model wearing a gold chandelier earring and layered necklace"
          width={1600}
          height={1000}
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-ink/45" />
        <div className="relative mx-auto flex min-h-[86vh] max-w-[90rem] flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-24 lg:min-h-[92vh]">
          <Reveal className="max-w-2xl text-ink-foreground">
            <p className="eyebrow text-gold-light">The Signature Collection</p>
            <h1 className="display-xl mt-6 text-4xl text-balance sm:text-6xl lg:text-7xl">
              Jewelry That Feels Like An Heirloom
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink-foreground/80 sm:text-base">
              Hand-finished artificial jewelry in warm 18K gold plating — made for the wedding, the
              festival and the ordinary Tuesday alike.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="brand">
                <Link to="/shop">
                  Shop The Collection <ArrowRight aria-hidden strokeWidth={1.5} />
                </Link>
              </Button>
              <Button
                asChild
                variant="line"
                size="brand"
                className="border-ink-foreground/40 text-ink-foreground hover:bg-ink-foreground/10"
              >
                <Link to="/new-arrivals">New Arrivals</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Categories */}
      <section
        aria-labelledby="categories-title"
        className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 sm:py-28"
      >
        <SectionHeading
          eyebrow="Shop By Category"
          title="Find Your Piece"
          description="Six edits, each designed to be worn together or entirely on its own."
          className="mb-14"
        />
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {categories.map((category, i) => (
            <li key={category.slug}>
              <Reveal delay={i * 0.05}>
                <Link
                  to="/category/$slug"
                  params={{ slug: category.slug }}
                  className="group relative block aspect-4/5 overflow-hidden bg-sand"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    width={800}
                    height={1000}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
                  />
                  <span className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                    <span className="block font-serif text-xl text-ink-foreground sm:text-2xl">
                      {category.name}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-2 text-[0.65rem] tracking-[0.2em] uppercase text-gold-light">
                      Explore <ArrowRight aria-hidden className="size-3" strokeWidth={1.5} />
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* New arrivals */}
      <section aria-labelledby="new-title" className="bg-sand-soft">
        <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 sm:py-28">
          <SectionHeading
            eyebrow="Just In"
            title="New Arrivals"
            align="left"
            className="mb-12"
            action={
              <Button asChild variant="line" size="brandSm">
                <Link to="/new-arrivals">
                  View all <ArrowRight aria-hidden strokeWidth={1.5} />
                </Link>
              </Button>
            }
          />
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      {/* Editorial */}
      <section
        aria-labelledby="editorial-title"
        className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative aspect-4/5 overflow-hidden bg-sand">
              <img
                src={img.editorial}
                alt="Close-up of a hand-finished gold necklace resting on silk"
                width={1000}
                height={1250}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow">Our Craft</p>
            <h2
              id="editorial-title"
              className="display-xl mt-5 text-3xl text-balance sm:text-4xl lg:text-5xl"
            >
              Made Slowly, In Small Batches
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Each design begins as a drawing and ends in the hands of the same six artisans. We
              plate in warm 18K gold, set every stone by hand and seal the finish so it survives
              real wear — not just the photograph.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              The result is jewelry with the weight and glow of fine pieces, at a price that lets
              you own the whole look.
            </p>
            <Button asChild variant="ink" size="brand" className="mt-10">
              <Link to="/about">Our Story</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Best sellers */}
      <section
        aria-labelledby="best-title"
        className="mx-auto max-w-[90rem] px-5 pb-20 sm:px-8 sm:pb-28"
      >
        <SectionHeading
          eyebrow="Loved Most"
          title="Best Sellers"
          description="The pieces our customers keep coming back for."
          className="mb-14"
        />
        <ProductGrid products={bestSellers} />
      </section>

      {/* Occasions */}
      <section aria-labelledby="occasions-title" className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mb-14 text-center">
            <p className="eyebrow text-gold-light">Curated Edits</p>
            <h2 id="occasions-title" className="display-xl mt-5 text-3xl text-balance sm:text-4xl">
              Shop By Occasion
            </h2>
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {occasions.map((occasion, i) => (
              <li key={occasion.slug} className={i === 0 ? "col-span-2 lg:col-span-1" : undefined}>
                <Reveal delay={i * 0.05}>
                  <Link
                    to="/collections"
                    className="group relative block aspect-3/4 overflow-hidden bg-ink-soft"
                  >
                    <img
                      src={occasion.image}
                      alt={occasion.name}
                      width={700}
                      height={933}
                      loading="lazy"
                      className="size-full object-cover opacity-85 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent"
                    />
                    <span className="absolute inset-x-0 bottom-0 p-4">
                      <span className="block font-serif text-lg">{occasion.name}</span>
                      <span className="mt-1 block text-xs text-ink-foreground/65">
                        {occasion.tagline}
                      </span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why us */}
      <section
        aria-labelledby="why-title"
        className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 sm:py-28"
      >
        <SectionHeading eyebrow="Why Velora" title="Quietly Better" className="mb-14" />
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map(({ Icon, title, body }, i) => (
            <li key={title}>
              <Reveal delay={i * 0.05} className="flex flex-col gap-4 border-t border-gold/40 pt-6">
                <Icon aria-hidden className="size-6 text-gold" strokeWidth={1.25} />
                <h3 className="font-serif text-xl">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Testimonials */}
      <section aria-labelledby="reviews-title" className="bg-sand-soft">
        <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 sm:py-28">
          <SectionHeading eyebrow="Kind Words" title="What Our Customers Say" className="mb-14" />
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 6).map((t, i) => (
              <li key={t.id}>
                <Reveal delay={i * 0.05} className="h-full">
                  <TestimonialCard testimonial={t} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Instagram */}
      <section
        aria-labelledby="instagram-title"
        className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 sm:py-28"
      >
        <SectionHeading
          eyebrow="@velorafinejewelry"
          title="Follow Our Story"
          description="Styling notes, behind-the-bench moments and new pieces first."
          className="mb-14"
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {galleryImages.map((src, i) => (
            <li key={i}>
              <Link
                to="/shop"
                aria-label="View the collection on Instagram"
                className="group relative block aspect-square overflow-hidden bg-sand"
              >
                <img
                  src={src}
                  alt=""
                  width={500}
                  height={500}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <Instagram className="size-5 text-ink-foreground" strokeWidth={1.25} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Newsletter />
    </>
  );
}
