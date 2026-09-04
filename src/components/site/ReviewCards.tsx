import { Quote } from "lucide-react";
import { Stars } from "./Stars";
import type { Review, Testimonial } from "@/data/types";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col gap-5 border border-border bg-card p-7 transition-shadow duration-500 hover:shadow-lift">
      <Quote aria-hidden className="size-5 text-gold" strokeWidth={1.25} />
      <blockquote className="flex-1 font-serif text-lg leading-relaxed text-foreground">
        “{testimonial.review}”
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-border pt-5">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sand text-xs tracking-widest text-gold"
        >
          {testimonial.initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm">{testimonial.name}</span>
          <span className="block text-xs text-muted-foreground">{testimonial.location}</span>
        </span>
        <Stars rating={testimonial.rating} className="ml-auto shrink-0" />
      </figcaption>
    </figure>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="border-b border-border py-7 last:border-b-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sand text-[0.65rem] tracking-widest text-gold"
          >
            {review.initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm">{review.name}</span>
            <span className="block text-xs text-muted-foreground">{review.date}</span>
          </span>
        </div>
        <Stars rating={review.rating} />
      </div>
      <h4 className="mt-4 font-serif text-lg">{review.title}</h4>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        {review.body}
      </p>
    </article>
  );
}
