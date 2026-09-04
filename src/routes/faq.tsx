import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqs } from "@/data/testimonials";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Ordering, Shipping & Care | Velora" },
      {
        name: "description",
        content:
          "Answers on WhatsApp ordering, payment, delivery times, returns, plating quality and how to care for artificial jewelry.",
      },
      { property: "og:title", content: "Velora FAQ" },
      {
        property: "og:description",
        content: "Ordering, payment, shipping, returns, quality and care questions answered.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const groups = [...new Set(faqs.map((f) => f.category))];

  return (
    <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "FAQ" }]} />

      <header className="mt-8 mb-14 max-w-2xl">
        <p className="eyebrow">Good To Know</p>
        <h1 className="display-xl mt-5 text-3xl text-balance sm:text-4xl lg:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Everything about ordering, delivery, quality and care. Still unsure? Our team is a message
          away.
        </p>
      </header>

      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
        <div className="flex flex-col gap-12">
          {groups.map((group) => (
            <section key={group} aria-labelledby={`faq-${group}`}>
              <h2 id={`faq-${group}`} className="eyebrow mb-4">
                {group}
              </h2>
              <Accordion type="single" collapsible>
                {faqs
                  .filter((f) => f.category === group)
                  .map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left font-serif text-lg">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </section>
          ))}
        </div>

        <aside className="h-max border border-border bg-sand-soft p-7">
          <h2 className="font-serif text-2xl">Still have a question?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Message us on WhatsApp with your question or the piece you're considering — we reply
            within minutes during opening hours.
          </p>
          <Button asChild variant="whatsapp" size="brand" className="mt-7 w-full">
            <Link to="/contact">Contact us</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
