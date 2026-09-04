import { createFileRoute, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductBrowser } from "@/components/shop/ProductBrowser";
import { getCategory } from "@/data/categories";
import { useStore } from "@/context/store-context";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Category not found — Velora" }, { name: "robots", content: "noindex" }],
      };
    }
    const { category } = loaderData;
    const title = `${category.name} — Velora Fine Jewelry`;
    return {
      meta: [
        { title },
        { name: "description", content: category.description },
        { property: "og:title", content: title },
        { property: "og:description", content: category.description },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { products } = useStore();
  const items = products.filter((p) => p.category === category.slug);


  return (
    <div>
      <section className="relative isolate overflow-hidden bg-sand">
        <img
          src={category.image}
          alt=""
          width={1600}
          height={700}
          className="absolute inset-0 size-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-ink/50" />
        <div className="relative mx-auto max-w-[90rem] px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-xl text-ink-foreground">
            <p className="eyebrow text-gold-light">{items.length} pieces</p>
            <h1 className="display-xl mt-5 text-4xl text-balance sm:text-5xl">{category.name}</h1>
            <p className="mt-5 text-sm leading-relaxed text-ink-foreground/80 sm:text-base">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 sm:py-14">
        <Breadcrumbs items={[{ label: "Shop", to: "/shop" }, { label: category.name }]} />
        <div className="mt-10">
          <ProductBrowser products={items} showCategories={false} />
        </div>
      </div>
    </div>
  );
}
