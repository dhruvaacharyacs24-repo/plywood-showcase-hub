import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { listCategories, listProducts } from "@/lib/catalog.functions";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  q: z.string().optional(),
});

const catsQuery = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });
const productsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: () => listProducts({ data: {} }),
});

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Products — Aashlesha Enterprises" },
      { name: "description", content: "Browse plywood, plastics, tarpaulins and interior design materials." },
      { property: "og:title", content: "Products — Aashlesha Enterprises" },
      { property: "og:description", content: "Browse plywood, plastics, tarpaulins and interior design materials." },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catsQuery);
    context.queryClient.ensureQueryData(productsQuery);
  },
  component: ProductsPage,
});

function ProductsPage() {
  const { category, subcategory } = Route.useSearch();
  const { data: catData } = useSuspenseQuery(catsQuery);
  const { data: allProducts } = useSuspenseQuery(productsQuery);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let items = allProducts;
    if (category) items = items.filter((p) => p.category?.slug === category);
    if (subcategory) items = items.filter((p) => p.subcategory?.slug === subcategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      );
    }
    return items;
  }, [allProducts, category, subcategory, query]);

  const subs = category ? catData.subcategories.filter((s) => {
    const cat = catData.categories.find((c) => c.slug === category);
    return cat && s.category_id === cat.id;
  }) : [];

  return (
    <SiteLayout>
      <section className="border-b border-border bg-[oklch(0.16_0.008_60)] text-white">
        <div className="container-page py-14">
          <div className="eyebrow text-primary">Catalog</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">Products</h1>
          <p className="mt-3 text-white/70 max-w-2xl">
            Browse our full inventory. Contact us for bulk pricing, custom sizes or trade accounts.
          </p>
        </div>
      </section>

      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Filters */}
          <aside className="space-y-6">
            <div>
              <div className="eyebrow mb-3">Search</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9 rounded-none"
                />
              </div>
            </div>
            <div>
              <div className="eyebrow mb-3">Categories</div>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link
                    to="/products"
                    search={{}}
                    className={cn(
                      "block px-3 py-2 border-l-2 border-transparent hover:bg-muted",
                      !category && "border-primary bg-muted font-semibold",
                    )}
                  >
                    All Products
                  </Link>
                </li>
                {catData.categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/products"
                      search={{ category: c.slug }}
                      className={cn(
                        "block px-3 py-2 border-l-2 border-transparent hover:bg-muted",
                        category === c.slug && !subcategory && "border-primary bg-muted font-semibold",
                      )}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {subs.length > 0 && (
              <div>
                <div className="eyebrow mb-3">Subcategories</div>
                <ul className="space-y-1 text-sm">
                  {subs.map((s) => (
                    <li key={s.id}>
                      <Link
                        to="/products"
                        search={{ category, subcategory: s.slug }}
                        className={cn(
                          "block px-3 py-2 border-l-2 border-transparent hover:bg-muted",
                          subcategory === s.slug && "border-primary bg-muted font-semibold",
                        )}
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Grid */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filtered.length} product{filtered.length === 1 ? "" : "s"}
              </p>
            </div>
            {filtered.length === 0 ? (
              <div className="border border-dashed border-border p-16 text-center text-muted-foreground">
                No products match your filters.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
