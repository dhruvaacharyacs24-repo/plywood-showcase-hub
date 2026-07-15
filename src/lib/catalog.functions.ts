import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function isNewKey(v: string) {
  return v.startsWith("sb_publishable_") || v.startsWith("sb_secret_");
}
function makePublicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (isNewKey(key) && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = makePublicClient();
  const [{ data: cats, error: e1 }, { data: subs, error: e2 }] = await Promise.all([
    sb.from("categories").select("*").order("sort_order"),
    sb.from("subcategories").select("*").order("sort_order"),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  return { categories: cats ?? [], subcategories: subs ?? [] };
});

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input: { category?: string; subcategory?: string; q?: string; featured?: boolean } | undefined) =>
    (input ?? {}) as { category?: string; subcategory?: string; q?: string; featured?: boolean },
  )
  .handler(async ({ data }) => {
    const sb = makePublicClient();
    let q = sb
      .from("products")
      .select("*, category:categories(id,name,slug), subcategory:subcategories(id,name,slug)")
      .order("created_at", { ascending: false });
    if (data.featured) q = q.eq("featured", true).limit(6);
    if (data.q && data.q.trim()) q = q.ilike("name", `%${data.q.trim()}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    let items = rows ?? [];
    if (data.category) items = items.filter((p) => p.category?.slug === data.category);
    if (data.subcategory) items = items.filter((p) => p.subcategory?.slug === data.subcategory);
    return items;
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const sb = makePublicClient();
    const { data: row, error } = await sb
      .from("products")
      .select("*, category:categories(id,name,slug), subcategory:subcategories(id,name,slug)")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

/* ---------- Admin ---------- */

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(120),
  category_id: z.string().uuid().nullable(),
  subcategory_id: z.string().uuid().nullable(),
  description: z.string().max(4000).nullable(),
  specifications: z.array(z.object({ label: z.string().max(80), value: z.string().max(200) })),
  price: z.number().nullable(),
  price_on_request: z.boolean(),
  price_unit: z.string().max(30).nullable(),
  in_stock: z.boolean(),
  images: z.array(z.string().url()).max(10),
  featured: z.boolean(),
});

async function assertAdmin(ctx: { supabase: ReturnType<typeof createClient<Database>>; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required");
}

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) return false;
    return Boolean(data);
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = { ...data, specifications: data.specifications as unknown as Database["public"]["Tables"]["products"]["Insert"]["specifications"] };
    const { error } = data.id
      ? await context.supabase.from("products").update(payload).eq("id", data.id)
      : await context.supabase.from("products").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80),
  description: z.string().max(500).nullable().optional(),
  sort_order: z.number().int().default(0),
});
export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => categorySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = data.id
      ? await context.supabase.from("categories").update(data).eq("id", data.id)
      : await context.supabase.from("categories").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const subcategorySchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid(),
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80),
  sort_order: z.number().int().default(0),
});
export const upsertSubcategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => subcategorySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = data.id
      ? await context.supabase.from("subcategories").update(data).eq("id", data.id)
      : await context.supabase.from("subcategories").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSubcategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("subcategories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
