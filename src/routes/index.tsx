import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Award, Package, ShieldCheck, Truck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { listCategories, listProducts } from "@/lib/catalog.functions";
import { SITE } from "@/lib/site";
import hero from "@/assets/hero-warehouse.jpg";
import catPlywood from "@/assets/cat-plywood.jpg";
import catPlastics from "@/assets/cat-plastics.jpg";
import catTarpaulins from "@/assets/cat-tarpaulins.jpg";
import catInterior from "@/assets/cat-interior.jpg";

const catImages: Record<string, string> = {
  plywood: catPlywood,
  plastics: catPlastics,
  tarpaulins: catTarpaulins,
  "interior-design-items": catInterior,
};

const catsQuery = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });
const featuredQuery = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: () => listProducts({ data: { featured: true } }),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catsQuery);
    context.queryClient.ensureQueryData(featuredQuery);
  },
  component: Home,
});

function Home() {
  const { data: catData } = useSuspenseQuery(catsQuery);
  const { data: featured } = useSuspenseQuery(featuredQuery);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[oklch(0.14_0.008_60)] text-white">
        <img
          src={hero}
          alt=""
          width={1920}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.008_60)] via-[oklch(0.12_0.008_60)/0.6] to-transparent" />
        <div className="container-page relative py-24 md:py-36 max-w-3xl">
          <div className="eyebrow text-primary">Wholesale & Retail Supplier</div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05]">
            Materials that build{" "}
            <span className="text-primary">trust</span>, delivered on time.
          </h1>
          <p className="mt-5 text-lg text-white/70 max-w-xl">
            {SITE.name} supplies premium plywood, plastics, tarpaulins and interior design materials
            to contractors, retailers and homeowners.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-none">
              <Link to="/products">
                Browse Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none border-white/30 bg-transparent text-white hover:bg-white hover:text-ink">
              <Link to="/contact">Get a Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Award, title: "Trusted Quality", body: "ISI-grade materials sourced from reputed mills and manufacturers." },
            { icon: ShieldCheck, title: "Best Pricing", body: "Wholesale rates for bulk buyers, transparent retail pricing." },
            { icon: Truck, title: "Fast Delivery", body: "Same-day dispatch across the city; pan-India logistics." },
            { icon: Package, title: "Wide Inventory", body: "1000+ SKUs — plywood, plastics, tarpaulins & interior finishes." },
          ].map((f) => (
            <div key={f.title} className="border border-border bg-card p-6">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page pb-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow">Explore</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">Featured Categories</h2>
          </div>
          <Link to="/products" className="hidden sm:inline text-sm font-semibold text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {catData.categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className="group relative aspect-[4/5] overflow-hidden bg-muted"
            >
              <img
                src={catImages[c.slug] ?? catPlywood}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Category
                </div>
                <div className="mt-1 font-display text-xl font-bold">{c.name}</div>
                <div className="mt-1 text-xs text-white/70">{c.description}</div>
                <div className="mt-3 text-xs font-semibold text-white group-hover:text-primary flex items-center gap-1">
                  Browse <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="container-page pb-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <div className="eyebrow">In Stock Now</div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">Featured Products</h2>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[oklch(0.16_0.008_60)] text-white">
        <div className="container-page py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="eyebrow text-primary">Ready to order?</div>
            <h3 className="mt-2 font-display text-2xl md:text-3xl font-bold">
              Talk to our team. Get a quote in hours, not days.
            </h3>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" className="rounded-none">
              <Link to="/contact">Enquire Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none border-white/30 bg-transparent text-white hover:bg-white hover:text-ink">
              <Link to="/products">See Catalog</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
