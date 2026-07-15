import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { SITE, telLink } from "@/lib/site";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center bg-primary text-primary-foreground font-display font-bold">
            AE
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-sm font-bold tracking-tight">{SITE.name}</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {SITE.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
              activeProps={{ className: "px-3 py-2 text-sm font-semibold text-ink" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telLink()}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4" />
            {SITE.phone}
          </a>
          <Button asChild size="sm" className="hidden md:inline-flex rounded-none">
            <Link to="/contact">Enquire</Link>
          </Button>
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center border border-border"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container-page flex flex-col py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium border-b border-border/60 last:border-0"
                activeProps={{ className: "py-3 text-sm font-semibold text-primary border-b border-border/60 last:border-0" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <a href={telLink()} className="py-3 text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" /> {SITE.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
