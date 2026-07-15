import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/catalog.functions";
import { formatPrice } from "@/lib/format";
import { SITE, telLink, whatsappLink } from "@/lib/site";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { cn } from "@/lib/utils";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!p) throw notFound();
  },
  head: ({ loaderData: _loaderData, params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — ${SITE.name}` },
    ],
  }),
  component: ProductDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-primary font-semibold">
          ← Back to products
        </Link>
      </div>
    </SiteLayout>
  ),
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const [active, setActive] = useState(0);
  const [showForm, setShowForm] = useState(false);

  if (!product) return null;
  const images = product.images.length > 0 ? product.images : [];
  const specs = (product.specifications as Array<{ label: string; value: string }>) ?? [];

  return (
    <SiteLayout>
      <div className="container-page py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
      </div>
      <div className="container-page pb-16 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/3] bg-muted overflow-hidden">
            {images[active] ? (
              <img src={images[active]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-muted-foreground">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActive(i)}
                  className={cn(
                    "aspect-square overflow-hidden border-2 transition-colors",
                    active === i ? "border-primary" : "border-transparent",
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <Link
              to="/products"
              search={{ category: product.category.slug }}
              className="eyebrow hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(product.price, product.price_unit, product.price_on_request)}
            </div>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-1",
                product.in_stock ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {product.in_stock ? "In stock" : "Out of stock"}
            </span>
          </div>

          {product.description && (
            <p className="mt-5 text-ink-soft leading-relaxed whitespace-pre-line">{product.description}</p>
          )}

          {specs.length > 0 && (
            <div className="mt-8">
              <div className="eyebrow mb-3">Specifications</div>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {specs.map((s, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-2.5 pr-4 font-semibold text-ink w-1/3">{s.label}</td>
                      <td className="py-2.5 text-ink-soft">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-none" onClick={() => setShowForm((v) => !v)}>
              Enquire Now
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none">
              <a href={whatsappLink(`Hi, I'm interested in ${product.name}`)} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none">
              <a href={telLink()}>
                <Phone className="mr-2 h-4 w-4" /> Call
              </a>
            </Button>
          </div>

          {showForm && (
            <div className="mt-8 border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold">Send an enquiry</h3>
              <p className="mt-1 text-sm text-muted-foreground">We'll get back within a few hours.</p>
              <div className="mt-4">
                <EnquiryForm
                  productId={product.id}
                  productName={product.name}
                  onSuccess={() => setShowForm(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
