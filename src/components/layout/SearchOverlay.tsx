import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, SearchX, Search as SearchIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/site/EmptyState";
import { categories } from "@/data/categories";
import { popularSearches, recentSearches } from "@/data/testimonials";
import { searchProducts } from "@/data/products";
import { useStore } from "@/context/store-context";
import { formatPrice } from "@/lib/format";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, products } = useStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) =>
        [p.name, p.description, p.category, p.collection, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  }, [query, products]);

  const matchedCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  const close = () => {
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {searchOpen ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 z-100 flex flex-col bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="border-b border-border">
            <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-5 sm:px-8">
              <SearchIcon aria-hidden className="size-5 shrink-0 text-gold" strokeWidth={1.25} />
              <label htmlFor="site-search" className="sr-only">
                Search jewelry
              </label>
              <Input
                id="site-search"
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search earrings, bridal sets, pearls…"
                className="h-11 flex-1 rounded-none border-0 bg-transparent px-0 font-serif text-lg shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                <X aria-hidden className="size-5" strokeWidth={1.25} />
              </button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-5 py-8 sm:px-8">
            {!query.trim() ? (
              <div className="flex flex-col gap-10">
                <section>
                  <p className="eyebrow mb-4 flex items-center gap-2">
                    <Clock aria-hidden className="size-3.5" strokeWidth={1.5} /> Recent searches
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <li key={term}>
                        <button
                          type="button"
                          onClick={() => setQuery(term)}
                          className="cursor-pointer border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-gold hover:text-foreground"
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="eyebrow mb-4">Popular right now</p>
                  <ul className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <li key={term}>
                        <button
                          type="button"
                          onClick={() => setQuery(term)}
                          className="cursor-pointer bg-sand px-3 py-2 text-xs text-foreground transition-colors hover:bg-gold-light"
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="eyebrow mb-4">Browse categories</p>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <Link
                          to="/category/$slug"
                          params={{ slug: c.slug }}
                          onClick={close}
                          className="group flex items-center gap-3 border border-border p-2 transition-colors hover:border-gold"
                        >
                          <img
                            src={c.image}
                            alt=""
                            width={80}
                            height={100}
                            loading="lazy"
                            className="size-12 shrink-0 object-cover"
                          />
                          <span className="min-w-0 truncate text-xs tracking-[0.14em] uppercase">
                            {c.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            ) : results.length || matchedCategories.length ? (
              <div className="flex flex-col gap-10">
                {matchedCategories.length ? (
                  <section>
                    <p className="eyebrow mb-4">Categories</p>
                    <ul className="flex flex-wrap gap-2">
                      {matchedCategories.map((c) => (
                        <li key={c.slug}>
                          <Link
                            to="/category/$slug"
                            params={{ slug: c.slug }}
                            onClick={close}
                            className="inline-flex border border-border px-3 py-2 text-xs transition-colors hover:border-gold"
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <section>
                  <p className="eyebrow mb-4">
                    {results.length} {results.length === 1 ? "result" : "results"}
                  </p>
                  <ul className="flex flex-col divide-y divide-border">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/product/$slug"
                          params={{ slug: p.slug }}
                          onClick={close}
                          className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-4"
                        >
                          <img
                            src={p.images[0]}
                            alt=""
                            width={80}
                            height={100}
                            loading="lazy"
                            className="size-16 shrink-0 bg-sand object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-serif text-lg transition-colors group-hover:text-gold">
                              {p.name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {p.description}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm">
                            {formatPrice(p.salePrice ?? p.price)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title={`No results for “${query}”`}
                description="Try a different word, or browse a category — our team can also help you find a piece over WhatsApp."
              />
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
