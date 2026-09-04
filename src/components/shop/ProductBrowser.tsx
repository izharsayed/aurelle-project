import { useEffect, useMemo, useState, useRef } from "react";
import { ArrowUp, ChevronDown, LayoutGrid, Loader2, PackageSearch, Rows3, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";
import { ProductGridSkeleton } from "./ProductSkeletons";
import { SortDropdown } from "./SortDropdown";
import { EmptyState } from "@/components/site/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Product } from "@/data/types";
import { applyFilters, emptyFilters, type FilterState, type SortKey } from "@/lib/filters";
import { cn } from "@/lib/utils";

const INITIAL_PAGE_SIZE = 12;
const LOAD_MORE_STEP = 8;

interface ProductBrowserProps {
  products: Product[];
  showCategories?: boolean | undefined;
  /** Simulates the first data fetch so skeletons are demonstrable. */
  simulateLoading?: boolean | undefined;
}

export function ProductBrowser({
  products,
  showCategories = true,
  simulateLoading = true,
}: ProductBrowserProps) {
  const maxPrice = useMemo(
    () => Math.ceil(Math.max(...products.map((p) => p.price)) / 500) * 500,
    [products],
  );
  const [filters, setFilters] = useState<FilterState>(() => emptyFilters(maxPrice));
  const [sort, setSort] = useState<SortKey>("featured");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
  const [loading, setLoading] = useState(simulateLoading);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!simulateLoading) return;
    const t = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(t);
  }, [simulateLoading]);

  useEffect(() => setFilters(emptyFilters(maxPrice)), [maxPrice]);
  useEffect(() => setVisibleCount(INITIAL_PAGE_SIZE), [filters, sort]);

  const results = useMemo(() => applyFilters(products, filters, sort), [products, filters, sort]);
  const current = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;
  const progressPercent = results.length > 0 ? Math.min(100, Math.round((current.length / results.length) * 100)) : 100;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(results.length, prev + LOAD_MORE_STEP));
      setIsLoadingMore(false);
    }, 400);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filterPanel = (
    <ProductFilters
      filters={filters}
      onChange={setFilters}
      maxPrice={maxPrice}
      showCategories={showCategories}
    />
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
      {/* Desktop Sidebar Filters */}
      <aside className="hidden lg:block">
        <div className="sticky top-28">{filterPanel}</div>
      </aside>

      <div className="min-w-0">
        {/* Top Filter and View Bar */}
        <div className="flex flex-col gap-3 border-y border-border py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <Input
                type="search"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                placeholder="Search pieces..."
                aria-label="Search products"
                className="h-9 rounded-none border-border bg-card pl-9 text-xs sm:text-sm w-full"
              />
            </div>

            {/* Mobile Filters Drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="line" size="sm" className="h-9 gap-1.5 px-3 lg:hidden text-xs font-medium shrink-0">
                  <SlidersHorizontal aria-hidden className="size-3.5" strokeWidth={1.5} /> Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto bg-background">
                <SheetHeader>
                  <SheetTitle className="font-serif text-xl font-light">Refine</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-10">{filterPanel}</div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 md:pt-0 md:justify-end">
            <p className="text-xs font-medium text-muted-foreground">
              {results.length} {results.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="flex items-center gap-3">
              <SortDropdown value={sort} onChange={setSort} />
              <div className="hidden items-center border border-border sm:flex">
                {(
                  [
                    { key: "grid", Icon: LayoutGrid, label: "Grid view" },
                    { key: "list", Icon: Rows3, label: "List view" },
                  ] as const
                ).map(({ key, Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    aria-label={label}
                    aria-pressed={layout === key}
                    onClick={() => setLayout(key)}
                    className={cn(
                      "flex size-10 cursor-pointer items-center justify-center transition-colors",
                      layout === key
                        ? "bg-ink text-ink-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon aria-hidden className="size-4" strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid & Load More Container */}
        <div className="pt-8">
          {loading ? (
            <ProductGridSkeleton />
          ) : current.length ? (
            <>
              <ProductGrid products={current} layout={layout} />

              {/* Luxury Progress Bar & Load More Section */}
              <div ref={loadMoreRef} className="mt-16 flex flex-col items-center justify-center space-y-4 border-t border-border pt-10">
                {/* Piece counter text */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 text-gold" />
                  <span>
                    Showing <strong className="text-foreground font-semibold">{current.length}</strong> of{" "}
                    <strong className="text-foreground font-semibold">{results.length}</strong> pieces
                  </span>
                </div>

                {/* Progress bar track */}
                <div className="h-1.5 w-64 max-w-xs rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Action button: Load More or Reached End */}
                {hasMore ? (
                  <Button
                    variant="line"
                    size="brand"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="mt-2 min-w-48 gap-2 border-ink text-ink hover:bg-ink hover:text-ink-foreground transition-all duration-300"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-gold" />
                        Loading pieces...
                      </>
                    ) : (
                      <>
                        Load More Pieces
                        <ChevronDown className="size-4 text-muted-foreground" />
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="mt-2 flex flex-col items-center gap-3">
                    <p className="text-xs text-muted-foreground italic">
                      You've reached the end of the collection.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={scrollToTop}
                      className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
                    >
                      <ArrowUp className="size-3.5" /> Back to top
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No pieces match those filters"
              description="Try widening your price range or clearing a filter or two — the rest of the collection is waiting."
              action={
                <Button
                  variant="line"
                  size="brandSm"
                  onClick={() => setFilters(emptyFilters(maxPrice))}
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
