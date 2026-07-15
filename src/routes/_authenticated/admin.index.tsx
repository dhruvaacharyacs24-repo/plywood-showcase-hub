import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { MessageSquare, Package, Tag } from "lucide-react";
import { isAdmin, listCategories, listProducts } from "@/lib/catalog.functions";
import { listEnquiries } from "@/lib/enquiries.functions";

const adminQ = queryOptions({ queryKey: ["is-admin"], queryFn: () => isAdmin() });
const catsQ = queryOptions({ queryKey: ["admin", "cats"], queryFn: () => listCategories() });
const prodQ = queryOptions({ queryKey: ["admin", "products", "all"], queryFn: () => listProducts({ data: {} }) });
const enqQ = queryOptions({ queryKey: ["admin", "enquiries"], queryFn: () => listEnquiries() });

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(adminQ);
    context.queryClient.ensureQueryData(catsQ);
    context.queryClient.ensureQueryData(prodQ);
    context.queryClient.ensureQueryData(enqQ);
  },
  component: Dashboard,
});

function Dashboard() {
  const { data: admin } = useSuspenseQuery(adminQ);
  if (!admin) {
    return (
      <div className="border border-border bg-card p-8">
        <h1 className="font-display text-2xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is signed in but doesn't have admin privileges. Sign up with the designated
          admin email to be granted admin automatically.
        </p>
      </div>
    );
  }
  const { data: cats } = useSuspenseQuery(catsQ);
  const { data: products } = useSuspenseQuery(prodQ);
  const { data: enquiries } = useSuspenseQuery(enqQ);
  const unread = enquiries.filter((e) => !e.is_read).length;

  const stats = [
    { label: "Products", value: products.length, icon: Package, to: "/admin/products" },
    { label: "Categories", value: cats.categories.length, icon: Tag, to: "/admin/categories" },
    { label: "Enquiries", value: enquiries.length, sub: `${unread} unread`, icon: MessageSquare, to: "/admin/enquiries" },
  ] as const;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your catalog and enquiries.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="border border-border bg-card p-6 hover:border-primary transition-colors">
            <s.icon className="h-6 w-6 text-primary" />
            <div className="mt-4 font-display text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
            {"sub" in s && s.sub && <div className="mt-1 text-xs text-primary font-semibold">{s.sub}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
