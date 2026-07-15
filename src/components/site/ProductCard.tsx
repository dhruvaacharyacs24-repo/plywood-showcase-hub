import { Link } from "@tanstack/react-router";
import { formatPrice } from "@/lib/format";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  price_unit: string | null;
  price_on_request: boolean;
  in_stock: boolean;
  images: string[];
  category: { name: string; slug: string } | null;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const img = p.images?.[0];
  return (
    <Link
      to="/products/$slug"
      params={{ slug: p.slug }}
      className="group flex flex-col bg-card border border-border hover:border-primary/60 transition-all shadow-panel hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {img ? (
          <img
            src={img}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground text-xs uppercase tracking-widest">
            No image
          </div>
        )}
        {!p.in_stock && (
          <span className="absolute top-3 left-3 bg-background/90 text-xs font-semibold px-2 py-1">
            Out of stock
          </span>
        )}
        {p.category && (
          <span className="absolute bottom-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold px-2 py-1">
            {p.category.name}
          </span>
        )}
      </div>
      <div className="flex-1 p-4 flex flex-col gap-2">
        <h3 className="font-display font-bold text-lg leading-tight line-clamp-2">{p.name}</h3>
        {p.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border">
          <span className="font-semibold text-primary">
            {formatPrice(p.price, p.price_unit, p.price_on_request)}
          </span>
          <span className="text-xs font-medium text-ink-soft group-hover:text-primary">View →</span>
        </div>
      </div>
    </Link>
  );
}
