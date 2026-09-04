import { createFileRoute, Link } from "@tanstack/react-router";
import { Gem, HeartHandshake, Leaf, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Newsletter } from "@/components/site/Newsletter";
import { Button } from "@/components/ui/button";
import { img } from "@/data/images";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Velora Fine Jewelry" },
      {
        name: "description",
        content:
          "Velora Fine Jewelry makes hand-finished artificial jewelry in small batches: 18K gold plating, nickel-free alloys and six artisans behind every piece.",
      },
      { property: "og:title", content: "Our Story — Velora Fine Jewelry" },
      {
        property: "og:description",
        content: "Small-batch, hand-finished artificial jewelry made to be worn every day.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    Icon: Gem,
    title: "Craft First",
    body: "Six artisans, one bench, and a finishing check on every single piece before it is boxed.",
  },
  {
    Icon: Sparkles,
    title: "Finish That Lasts",
    body: "18K gold or rhodium plating sealed with an anti-tarnish coat rated for 12–18 months of wear.",
  },
  {
    Icon: Leaf,
    title: "Kind To Skin",
    body: "Nickel-free and lead-free alloys throughout, with rhodium options for reactive skin.",
  },
  {
    Icon: HeartHandshake,
    title: "Human Service",
    body: "A real person on WhatsApp who will style, size and follow up on your order.",
  },
];

function AboutPage() {
  return (
    <>
      <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 sm:py-14">
        <Breadcrumbs items={[{ label: "About" }]} />

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="eyebrow">Est. 2018 · Jaipur</p>
            <h1 className="display-xl mt-5 text-3xl text-balance sm:text-4xl lg:text-5xl">
              Fine Jewelry Feeling, Without The Fine Jewelry Price
            </h1>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Velora began with a simple frustration: artificial jewelry either looked the part and
              fell apart, or lasted and looked like plastic. We wanted the third option — pieces
              with real weight, warm colour and a finish that survives being worn.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              So we started small in Jaipur with six artisans, a short list of designs and a rule we
              still hold: if we wouldn't wear it every week, we don't sell it.
            </p>
            <Button asChild variant="ink" size="brand" className="mt-10">
              <Link to="/shop">Shop the collection</Link>
            </Button>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="aspect-4/5 overflow-hidden bg-sand">
              <img
                src={img.editorial}
                alt="Artisan finishing a gold-plated necklace by hand"
                width={1000}
                height={1250}
                className="size-full object-cover"
              />
            </div>
          </Reveal>
        </div>

        <section aria-labelledby="values-title" className="mt-24">
          <SectionHeading eyebrow="What We Stand For" title="Our Values" className="mb-14" />
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ Icon, title, body }, i) => (
              <li key={title}>
                <Reveal
                  delay={i * 0.05}
                  className="flex flex-col gap-4 border-t border-gold/40 pt-6"
                >
                  <Icon aria-hidden className="size-6 text-gold" strokeWidth={1.25} />
                  <h3 className="font-serif text-xl">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="numbers-title" className="mt-24 border-y border-border py-14">
          <h2 id="numbers-title" className="sr-only">
            Velora in numbers
          </h2>
          <dl className="grid gap-10 text-center sm:grid-cols-3">
            {[
              { value: "40,000+", label: "Pieces shipped" },
              { value: "4.8 / 5", label: "Average rating" },
              { value: "18K", label: "Gold plating" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="eyebrow order-2 mt-3">{stat.label}</dt>
                <dd className="font-serif text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <Newsletter />
    </>
  );
}
