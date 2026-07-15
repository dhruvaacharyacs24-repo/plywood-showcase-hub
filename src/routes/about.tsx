import { createFileRoute } from "@tanstack/react-router";
import { Award, Building2, HeartHandshake, Users } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About Us — ${SITE.name}` },
      { name: "description", content: `Learn about ${SITE.name} — trusted suppliers of plywood, plastics, tarpaulins and interior design materials.` },
      { property: "og:title", content: `About Us — ${SITE.name}` },
      { property: "og:description", content: `Learn about ${SITE.name} — trusted suppliers.` },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-[oklch(0.16_0.008_60)] text-white">
        <div className="container-page py-14">
          <div className="eyebrow text-primary">About Us</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">
            Built on decades of trust and craft.
          </h1>
        </div>
      </section>

      <section className="container-page py-16 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="prose max-w-none">
          <p className="text-lg text-ink-soft leading-relaxed">
            {SITE.name} is a family-run supplier of building materials, plastics, tarpaulins and
            interior finishes. What started as a small counter-shop has grown into one of the
            most trusted trade names in the region — powered entirely by word of mouth and
            repeat customers.
          </p>
          <h2 className="mt-10 font-display text-2xl font-bold">Our Mission</h2>
          <p className="mt-3 text-ink-soft leading-relaxed">
            To make premium materials available to everyone — from independent contractors on a
            single project to large builders running a dozen sites — with the same honest pricing
            and consistent quality.
          </p>
          <h2 className="mt-10 font-display text-2xl font-bold">Why Choose Us</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 not-prose">
            {[
              { icon: Award, title: "Only trusted brands", body: "We stock materials from mills and manufacturers with proven track records." },
              { icon: HeartHandshake, title: "Fair, transparent pricing", body: "No hidden charges. Wholesale rates for bulk orders." },
              { icon: Building2, title: "Trade accounts", body: "Credit terms and priority delivery for builders and contractors." },
              { icon: Users, title: "Real people, real service", body: "Talk to someone who knows the product, every single time." },
            ].map((f) => (
              <li key={f.title} className="border border-border p-5">
                <f.icon className="h-6 w-6 text-primary" />
                <div className="mt-3 font-display font-bold">{f.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.body}</div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit border border-border bg-card p-6">
          <div className="eyebrow">Numbers</div>
          <dl className="mt-4 grid grid-cols-2 gap-6">
            {[
              ["25+", "Years in trade"],
              ["1000+", "SKUs stocked"],
              ["5,000+", "Happy customers"],
              ["48hr", "Avg. delivery"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-3xl font-bold text-primary">{n}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </dl>
        </aside>
      </section>
    </SiteLayout>
  );
}
