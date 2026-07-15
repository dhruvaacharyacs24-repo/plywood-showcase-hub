import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { listCategories, listProducts, upsertProduct, deleteProduct } from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, slugify } from "@/lib/format";
import { cn } from "@/lib/utils";

const catsQ = queryOptions({ queryKey: ["admin", "cats"], queryFn: () => listCategories() });
const prodQ = queryOptions({ queryKey: ["admin", "products", "all"], queryFn: () => listProducts({ data: {} }) });

export const Route = createFileRoute("/_authenticated/admin/products")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catsQ);
    context.queryClient.ensureQueryData(prodQ);
  },
  component: AdminProducts,
});

type ProductRow = Awaited<ReturnType<typeof listProducts>>[number];

type FormState = {
  id?: string;
  name: string;
  slug: string;
  category_id: string;
  subcategory_id: string;
  description: string;
  specifications: Array<{ label: string; value: string }>;
  price: string;
  price_on_request: boolean;
  price_unit: string;
  in_stock: boolean;
  images: string[];
  featured: boolean;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  category_id: "",
  subcategory_id: "",
  description: "",
  specifications: [],
  price: "",
  price_on_request: false,
  price_unit: "",
  in_stock: true,
  images: [],
  featured: false,
};

function AdminProducts() {
  const { data: catData } = useSuspenseQuery(catsQ);
  const { data: products } = useSuspenseQuery(prodQ);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<FormState | null>(null);
  const [filter, setFilter] = useState("");

  const filtered = products.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit or remove catalog items.</p>
        </div>
        <Button className="rounded-none" onClick={() => setEditing({ ...emptyForm })}>
          <Plus className="h-4 w-4 mr-2" /> New Product
        </Button>
      </div>

      <div className="mt-6">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter products..."
          className="max-w-sm rounded-none"
        />
      </div>

      <div className="mt-6 border border-border bg-card divide-y divide-border">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No products yet.</div>
        )}
        {filtered.map((p) => (
          <ProductRow key={p.id} p={p} onEdit={() => setEditing(rowToForm(p))} onDeleted={() => qc.invalidateQueries({ queryKey: ["admin"] })} />
        ))}
      </div>

      {editing && (
        <ProductDialog
          state={editing}
          setState={setEditing}
          categories={catData.categories}
          subcategories={catData.subcategories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["admin"] });
            qc.invalidateQueries({ queryKey: ["products"] });
            qc.invalidateQueries({ queryKey: ["product"] });
          }}
        />
      )}
    </div>
  );
}

function rowToForm(p: ProductRow): FormState {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_id: p.category_id ?? "",
    subcategory_id: p.subcategory_id ?? "",
    description: p.description ?? "",
    specifications: (p.specifications as Array<{ label: string; value: string }>) ?? [],
    price: p.price != null ? String(p.price) : "",
    price_on_request: p.price_on_request,
    price_unit: p.price_unit ?? "",
    in_stock: p.in_stock,
    images: p.images ?? [],
    featured: p.featured,
  };
}

function ProductRow({ p, onEdit, onDeleted }: { p: ProductRow; onEdit: () => void; onDeleted: () => void }) {
  const del = useServerFn(deleteProduct);
  const mutation = useMutation({
    mutationFn: () => del({ data: { id: p.id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      onDeleted();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-4 flex items-center gap-4">
      <div className="h-14 w-14 bg-muted overflow-hidden shrink-0">
        {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{p.name}</div>
        <div className="text-xs text-muted-foreground">
          {p.category?.name ?? "Uncategorized"}
          {p.subcategory ? ` · ${p.subcategory.name}` : ""} · {formatPrice(p.price, p.price_unit, p.price_on_request)}
          {p.featured && " · Featured"} {!p.in_stock && " · Out of stock"}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="rounded-none" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-none"
          onClick={() => {
            if (confirm(`Delete "${p.name}"?`)) mutation.mutate();
          }}
          disabled={mutation.isPending}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function ProductDialog({
  state,
  setState,
  categories,
  subcategories,
  onClose,
  onSaved,
}: {
  state: FormState;
  setState: (s: FormState) => void;
  categories: Awaited<ReturnType<typeof listCategories>>["categories"];
  subcategories: Awaited<ReturnType<typeof listCategories>>["subcategories"];
  onClose: () => void;
  onSaved: () => void;
}) {
  const upsert = useServerFn(upsertProduct);
  const [uploading, setUploading] = useState(false);
  const { handleSubmit } = useForm();

  const mutation = useMutation({
    mutationFn: async () => {
      await upsert({
        data: {
          id: state.id,
          name: state.name.trim(),
          slug: state.slug.trim() || slugify(state.name),
          category_id: state.category_id || null,
          subcategory_id: state.subcategory_id || null,
          description: state.description || null,
          specifications: state.specifications.filter((s) => s.label.trim() && s.value.trim()),
          price: state.price_on_request ? null : state.price ? parseFloat(state.price) : null,
          price_on_request: state.price_on_request,
          price_unit: state.price_unit || null,
          in_stock: state.in_stock,
          images: state.images,
          featured: state.featured,
        },
      });
    },
    onSuccess: () => {
      toast.success("Product saved");
      onSaved();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setState({ ...state, images: [...state.images, ...uploaded] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const subs = subcategories.filter((s) => s.category_id === state.category_id);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4 overflow-y-auto">
      <div className="bg-background border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{state.id ? "Edit product" : "New product"}</h2>
          <button onClick={onClose} className="p-1"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit(() => mutation.mutate())} className="p-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Name *</Label>
              <Input
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value, slug: state.id ? state.slug : slugify(e.target.value) })}
                className="rounded-none mt-1.5"
                required
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={state.slug}
                onChange={(e) => setState({ ...state, slug: slugify(e.target.value) })}
                className="rounded-none mt-1.5"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <select
                value={state.category_id}
                onChange={(e) => setState({ ...state, category_id: e.target.value, subcategory_id: "" })}
                className="mt-1.5 w-full h-9 border border-input bg-background px-3 text-sm"
              >
                <option value="">— Select —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Subcategory</Label>
              <select
                value={state.subcategory_id}
                onChange={(e) => setState({ ...state, subcategory_id: e.target.value })}
                className="mt-1.5 w-full h-9 border border-input bg-background px-3 text-sm"
                disabled={!state.category_id}
              >
                <option value="">— None —</option>
                {subs.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={state.description}
              onChange={(e) => setState({ ...state, description: e.target.value })}
              rows={4}
              className="rounded-none mt-1.5"
            />
          </div>

          {/* Specs */}
          <div>
            <div className="flex items-center justify-between">
              <Label>Specifications</Label>
              <button
                type="button"
                className="text-xs font-semibold text-primary"
                onClick={() => setState({ ...state, specifications: [...state.specifications, { label: "", value: "" }] })}
              >
                + Add spec
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {state.specifications.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input
                    value={s.label}
                    onChange={(e) => {
                      const next = [...state.specifications];
                      next[i] = { ...next[i], label: e.target.value };
                      setState({ ...state, specifications: next });
                    }}
                    placeholder="Label (e.g. Thickness)"
                    className="rounded-none"
                  />
                  <Input
                    value={s.value}
                    onChange={(e) => {
                      const next = [...state.specifications];
                      next[i] = { ...next[i], value: e.target.value };
                      setState({ ...state, specifications: next });
                    }}
                    placeholder="Value (e.g. 18mm)"
                    className="rounded-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-none"
                    onClick={() =>
                      setState({ ...state, specifications: state.specifications.filter((_, j) => j !== i) })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Price (INR)</Label>
              <Input
                type="number"
                value={state.price}
                onChange={(e) => setState({ ...state, price: e.target.value })}
                className="rounded-none mt-1.5"
                disabled={state.price_on_request}
              />
            </div>
            <div>
              <Label>Unit (per)</Label>
              <Input
                value={state.price_unit}
                onChange={(e) => setState({ ...state, price_unit: e.target.value })}
                placeholder="sheet, sqft, kg..."
                className="rounded-none mt-1.5"
                disabled={state.price_on_request}
              />
            </div>
            <label className="flex items-end gap-3 pb-2">
              <Switch
                checked={state.price_on_request}
                onCheckedChange={(v) => setState({ ...state, price_on_request: v })}
              />
              <span className="text-sm">Price on request</span>
            </label>
          </div>

          {/* Toggles */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 border border-border p-3 text-sm">
              <Switch checked={state.in_stock} onCheckedChange={(v) => setState({ ...state, in_stock: v })} />
              In stock
            </label>
            <label className="flex items-center gap-3 border border-border p-3 text-sm">
              <Switch checked={state.featured} onCheckedChange={(v) => setState({ ...state, featured: v })} />
              Featured on home
            </label>
          </div>

          {/* Images */}
          <div>
            <Label>Images</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {state.images.map((img, i) => (
                <div key={img} className="relative group aspect-square bg-muted overflow-hidden">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setState({ ...state, images: state.images.filter((_, j) => j !== i) })}
                    className="absolute top-1 right-1 bg-black/70 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className={cn("aspect-square border-2 border-dashed border-border grid place-items-center cursor-pointer text-xs text-muted-foreground hover:border-primary hover:text-primary", uploading && "opacity-50")}>
                {uploading ? "Uploading..." : "+ Upload"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={onFile} disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" className="rounded-none" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="rounded-none" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
