import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ReviewCard } from "@/components/site/ReviewCards";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfo } from "@/components/shop/ProductInfo";
import { ProductGrid } from "@/components/shop/ProductGrid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useStore } from "@/context/store-context";
import { getCategory } from "@/data/categories";
import { getProductBySlug, getRelatedProducts } from "@/data/products";
import { productReviews } from "@/data/testimonials";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
    return { product, slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.product) {
      return {
        meta: [{ title: "Product Detail — Velora Fine Jewelry" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — Velora Fine Jewelry`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: loaderProduct, slug } = Route.useLoaderData();
  const { products: storeProducts, catalogLoaded } = useStore();

  const product =
    loaderProduct ||
    storeProducts.find((p) => p.slug === slug || p.id === slug) ||
    getProductBySlug(slug);

  if (!product) {
    if (!catalogLoaded) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Locating piece...
          </p>
        </div>
      );
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-7xl font-bold text-foreground font-serif">404</h1>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Product not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The jewelry piece you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-6">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const category = getCategory(product.category);
  const related = getRelatedProducts(product, 4);

  return (
    <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Shop", to: "/shop" },
          ...(category ? [{ label: category.name, to: `/category/${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
      </div>

      <div className="mt-16 max-w-3xl">
        <Accordion type="single" collapsible defaultValue="details">
          <AccordionItem value="details">
            <AccordionTrigger className="font-serif text-lg">Product details</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="eyebrow mb-1">Material</dt>
                  <dd>{product.material}</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-1">Collection</dt>
                  <dd>{product.collection}</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-1">SKU</dt>
                  <dd>{product.sku}</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-1">Best for</dt>
                  <dd className="capitalize">{product.occasions.join(", ")}</dd>
                </div>
              </dl>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="care">
            <AccordionTrigger className="font-serif text-lg">Care instructions</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {product.care}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping">
            <AccordionTrigger className="font-serif text-lg">Shipping & returns</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              Dispatched within 24–48 hours with tracked, insured courier. Returns and exchanges are
              accepted within 7 days of delivery on unworn pieces in original packaging.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <section aria-labelledby="reviews-heading" className="mt-20 max-w-3xl">
        <h2 id="reviews-heading" className="display-xl text-2xl sm:text-3xl">
          Customer Reviews
        </h2>
        <div className="mt-6">
          {productReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>

      {related.length ? (
        <section aria-labelledby="related-heading" className="mt-24">
          <SectionHeading
            eyebrow="You May Also Like"
            title="Complete The Look"
            align="left"
            className="mb-10"
          />
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
