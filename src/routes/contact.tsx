import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Velora — Order & Styling Help" },
      {
        name: "description",
        content:
          "Talk to the Velora concierge team on WhatsApp for orders, sizing and styling help, or send us a message and we'll reply within a day.",
      },
      { property: "og:title", content: "Contact Velora" },
      {
        property: "og:description",
        content: "WhatsApp ordering, styling advice and order support from a real person.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Contact" }]} />

      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-20">
        <div>
          <p className="eyebrow">We'd Love To Hear From You</p>
          <h1 className="display-xl mt-5 text-3xl text-balance sm:text-4xl lg:text-5xl">
            Get In Touch
          </h1>
          <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
            Orders are confirmed over WhatsApp so we can check availability, share payment options
            and give you a delivery date in one conversation.
          </p>

          <ul className="mt-12 flex flex-col gap-8">
            {[
              {
                Icon: MessageCircle,
                title: "WhatsApp",
                body: "Fastest way to reach us — usually a reply within 10 minutes during opening hours.",
              },
              { Icon: Mail, title: "Email", body: "concierge@velorajewelry.com" },
              { Icon: Clock, title: "Hours", body: "Monday to Saturday, 10am – 7pm IST" },
              { Icon: MapPin, title: "Studio", body: "Jaipur, Rajasthan — visits by appointment" },
            ].map(({ Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-gold" strokeWidth={1.25} />
                <div className="min-w-0">
                  <h2 className="text-sm tracking-[0.14em] uppercase">{title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-border bg-card p-7 sm:p-9">
          <h2 className="font-serif text-2xl">Send A Message</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This form is a demo — nothing is sent anywhere.
          </p>
          <form
            className="mt-8 flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" required autoComplete="name" className="h-11 rounded-none" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-email">Email</Label>
              <Input
                id="c-email"
                type="email"
                required
                autoComplete="email"
                className="h-11 rounded-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-phone">Phone (optional)</Label>
              <Input id="c-phone" type="tel" autoComplete="tel" className="h-11 rounded-none" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-message">Message</Label>
              <Textarea id="c-message" required rows={5} className="rounded-none" />
            </div>
            <Button type="submit" variant="ink" size="brand">
              Send message
            </Button>
            <p aria-live="polite" className="flex min-h-5 items-center gap-2 text-xs text-whatsapp">
              {sent ? (
                <>
                  <Check aria-hidden className="size-3.5" /> Thanks — we'll be in touch shortly.
                </>
              ) : null}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
