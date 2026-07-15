import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, MessageSquare, Package, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedShell,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/categories", label: "Categories", icon: Tag, exact: false },
  { to: "/admin/enquiries", label: "Enquiries", icon: MessageSquare, exact: false },
] as const;

function AuthedShell() {
  const router = useRouter();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background sticky top-0 z-30">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="grid h-7 w-7 place-items-center bg-primary text-primary-foreground text-xs">AE</span>
            <span className="hidden sm:inline">{SITE.name}</span>
            <span className="text-xs font-medium text-muted-foreground">/ Admin</span>
          </Link>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>
      <div className="container-page py-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 h-fit">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.exact }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium text-ink-soft hover:bg-background hover:text-ink whitespace-nowrap",
                )}
                activeProps={{ className: "flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-background text-primary border-l-2 border-primary whitespace-nowrap" }}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
