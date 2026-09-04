import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { categories, collections, colorOptions, occasions } from "@/data/categories";
import type { OccasionSlug } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { activeFilterCount, emptyFilters, type FilterState } from "@/lib/filters";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  maxPrice: number;
  showCategories?: boolean | undefined;
}

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

function Row({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 py-1.5 text-sm font-medium text-foreground/90 transition-colors hover:text-foreground"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="rounded-none border-border data-[state=checked]:border-gold data-[state=checked]:bg-gold"
      />
      {label}
    </label>
  );
}

export function ProductFilters({
  filters,
  onChange,
  maxPrice,
  showCategories = true,
}: ProductFiltersProps) {
  const count = activeFilterCount(filters, maxPrice);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-[0.75rem] tracking-[0.24em] uppercase font-semibold text-foreground">
          Filters {count ? <span className="text-gold">({count})</span> : null}
        </h2>
        {count ? (
          <button
            type="button"
            onClick={() => onChange(emptyFilters(maxPrice))}
            className="cursor-pointer text-[0.68rem] tracking-[0.16em] uppercase font-medium text-foreground/70 hover:text-gold"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <Accordion type="multiple" defaultValue={["category", "price", "color"]} className="w-full">
        {showCategories ? (
          <AccordionItem value="category" className="border-border">
            <AccordionTrigger className="text-[0.75rem] tracking-[0.2em] uppercase font-semibold text-foreground hover:no-underline">
              Category
            </AccordionTrigger>
            <AccordionContent>
              {categories.map((c) => (
                <Row
                  key={c.slug}
                  id={`cat-${c.slug}`}
                  label={c.name}
                  checked={filters.categories.includes(c.slug)}
                  onCheckedChange={() =>
                    onChange({ ...filters, categories: toggle(filters.categories, c.slug) })
                  }
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        ) : null}

        <AccordionItem value="price" className="border-border">
          <AccordionTrigger className="text-[0.75rem] tracking-[0.2em] uppercase font-semibold text-foreground hover:no-underline">
            Price
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <Slider
              value={filters.price}
              min={0}
              max={maxPrice}
              step={100}
              onValueChange={(v) => onChange({ ...filters, price: [v[0]!, v[1]!] })}
              aria-label="Price range"
            />
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-foreground">
              <span>{formatPrice(filters.price[0])}</span>
              <span>{formatPrice(filters.price[1])}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color" className="border-border">
          <AccordionTrigger className="text-[0.75rem] tracking-[0.2em] uppercase font-semibold text-foreground hover:no-underline">
            Colour
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-1">
              {colorOptions.map((c) => {
                const active = filters.colors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange({ ...filters, colors: toggle(filters.colors, c.name) })}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 border px-2.5 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "border-gold text-foreground bg-gold/10"
                        : "border-border text-foreground/80 hover:border-gold/60 hover:text-foreground",
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-3 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="collection" className="border-border">
          <AccordionTrigger className="text-[0.75rem] tracking-[0.2em] uppercase font-semibold text-foreground hover:no-underline">
            Collection
          </AccordionTrigger>
          <AccordionContent>
            {collections.map((c) => (
              <Row
                key={c}
                id={`col-${c}`}
                label={c}
                checked={filters.collections.includes(c)}
                onCheckedChange={() =>
                  onChange({ ...filters, collections: toggle(filters.collections, c) })
                }
              />
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="occasion" className="border-border">
          <AccordionTrigger className="text-[0.75rem] tracking-[0.2em] uppercase font-semibold text-foreground hover:no-underline">
            Occasion
          </AccordionTrigger>
          <AccordionContent>
            {occasions.map((o) => (
              <Row
                key={o.slug}
                id={`occ-${o.slug}`}
                label={o.name}
                checked={filters.occasions.includes(o.slug)}
                onCheckedChange={() =>
                  onChange({
                    ...filters,
                    occasions: toggle<OccasionSlug>(filters.occasions, o.slug),
                  })
                }
              />
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability" className="border-border">
          <AccordionTrigger className="text-[0.75rem] tracking-[0.2em] uppercase font-semibold text-foreground hover:no-underline">
            Availability
          </AccordionTrigger>
          <AccordionContent>
            <label
              htmlFor="in-stock"
              className="flex cursor-pointer items-center justify-between py-1 text-sm font-medium text-foreground"
            >
              In stock only
              <Switch
                id="in-stock"
                checked={filters.inStockOnly}
                onCheckedChange={(checked) => onChange({ ...filters, inStockOnly: checked })}
                className="data-[state=checked]:bg-gold"
              />
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {count ? (
        <Button
          variant="line"
          size="brandSm"
          className="mt-6 w-full font-medium"
          onClick={() => onChange(emptyFilters(maxPrice))}
        >
          Reset filters
        </Button>
      ) : null}
    </div>
  );
}
