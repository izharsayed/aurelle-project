import { useState } from "react";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const src = images[active] ?? images[0]!;

  return (
    <div className="flex flex-col gap-4 sm:flex-row-reverse sm:gap-6">
      <div
        className="relative flex-1 overflow-hidden bg-sand"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setOrigin(
            `${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`,
          );
        }}
      >
        <img
          src={src}
          alt={`${name} — view ${active + 1}`}
          width={800}
          height={1000}
          className="aspect-4/5 w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transformOrigin: origin, transform: zoom ? "scale(1.7)" : "scale(1)" }}
        />
        <span className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-2 bg-card/90 px-3 py-1.5 text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground">
          <ZoomIn aria-hidden className="size-3.5" strokeWidth={1.5} /> Hover to zoom
        </span>
      </div>

      <div className="flex gap-3 sm:flex-col">
        {images.map((image, i) => (
          <button
            key={`${image}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show ${name} view ${i + 1}`}
            aria-pressed={active === i}
            className={cn(
              "w-16 shrink-0 cursor-pointer overflow-hidden border bg-sand transition-colors sm:w-20",
              active === i ? "border-gold" : "border-transparent hover:border-border",
            )}
          >
            <img
              src={image}
              alt=""
              width={160}
              height={200}
              loading="lazy"
              className="aspect-4/5 w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
