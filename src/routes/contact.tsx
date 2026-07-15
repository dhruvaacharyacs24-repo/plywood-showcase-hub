import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { SITE, telLink, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${SITE.name}` },
      { name: "description", content: `Get in touch with ${SITE.name} for pricing and orders.` },
      { property: "og:title", content: `Contact — ${SITE.name}` },
      { property: "og:description", content: `Get in touch with ${SITE.name} for pricing and orders.` },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-[oklch(0.16_0.008_60)] text-white">
        <div className="container-page py-14">
          <div className="eyebrow text-primary">Contact</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">Get in touch</h1>
          <p className="mt-3 text-white/70 max-w-xl">
            Send us an enquiry, WhatsApp us, or call directly. We reply within a few hours on business days.
          </p>
        </div>
      </section>

      <section className="container-page py-14 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="border border-border bg-card p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold">Send an enquiry</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us what you need and how many. We'll come back with pricing.
          </p>
          <div className="mt-6">
            <EnquiryForm />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="border border-border bg-card p-6">
            <div className="eyebrow">Reach us</div>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href={telLink()} className="hover:text-primary">{SITE.phone}</a>
              </li>
              <li className="flex gap-3">
                <MessageCircle className="h-5 w-5 text-primary shrink-0" />
                <a href={whatsappLink()} target="_blank" rel="noreferrer" className="hover:text-primary">
                  WhatsApp {SITE.whatsapp}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href={`mailto:${SITE.email}`} className="hover:text-primary">{SITE.email}</a>
              </li>
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{SITE.address}</span>
              </li>
            </ul>
          </div>

          <div className="border border-border overflow-hidden">
            <iframe
              title="Location"
              src={SITE.mapEmbed}
              width="100%"
              height="260"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}
