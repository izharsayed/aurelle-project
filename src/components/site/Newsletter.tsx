import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "./Reveal";

/** UI only — no email service is connected. */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section aria-labelledby="newsletter-title" className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28">
        <Reveal>
          <p className="eyebrow text-gold-light">Newsletter</p>
          <h2 id="newsletter-title" className="display-xl mt-5 text-3xl text-balance sm:text-4xl">
            Stay In The Loop
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-foreground/70">
            Be the first to discover new collections and exclusive offers.
          </p>

          <form
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              setDone(true);
              setEmail("");
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <Input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-12 rounded-none border-ink-foreground/25 bg-transparent text-ink-foreground placeholder:text-ink-foreground/40"
            />
            <Button type="submit" variant="gold" size="brand" className="sm:w-auto">
              Subscribe
            </Button>
          </form>

          <p
            aria-live="polite"
            className="mt-4 flex min-h-5 items-center justify-center gap-2 text-xs text-gold-light"
          >
            {done ? (
              <>
                <Check aria-hidden className="size-3.5" /> Thank you — you're on the list.
              </>
            ) : null}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
