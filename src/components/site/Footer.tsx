import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-[oklch(0.16_0.008_60)] text-[oklch(0.85_0.005_60)]">
      <div className="container-page py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={SITE.logo}
              alt={`${SITE.name} logo`}
              className="h-9 w-auto object-contain"
            />
          </div>
          <p className="mt-4 max-w-md text-sm text-white/60">{SITE.description}</p>
          <div className="mt-6 flex gap-3">
            <a href={SITE.social.facebook} aria-label="Facebook" className="grid h-9 w-9 place-items-center border border-white/15 hover:border-primary hover:text-primary transition-colors"><Facebook className="h-4 w-4" /></a>
            <a href={SITE.social.instagram} aria-label="Instagram" className="grid h-9 w-9 place-items-center border border-white/15 hover:border-primary hover:text-primary transition-colors"><Instagram className="h-4 w-4" /></a>
            <a href={SITE.social.linkedin} aria-label="LinkedIn" className="grid h-9 w-9 place-items-center border border-white/15 hover:border-primary hover:text-primary transition-colors"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <div className="eyebrow text-primary">Quick Links</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/products" className="hover:text-primary">Products</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow text-primary">Get in Touch</div>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0 mt-0.5" /><span>{SITE.phone}</span></li>
            <li className="flex gap-3"><Mail className="h-4 w-4 shrink-0 mt-0.5" /><a href={`mailto:${SITE.email}`} className="hover:text-primary">{SITE.email}</a></li>
            <li className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /><span>{SITE.address}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <Link to="/auth" className="hover:text-primary">Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}
