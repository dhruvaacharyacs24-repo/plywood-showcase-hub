import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteCategory,
  deleteSubcategory,
  listCategories,
  upsertCategory,
  upsertSubcategory,
} from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/format";

const catsQ = queryOptions({ queryKey: ["admin", "cats"], queryFn: () => listCategories() });

export const Route = createFileRoute("/_authenticated/admin/categories")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catsQ);
  },
  component: AdminCategories,
});

function AdminCategories() {
  const { data } = useSuspenseQuery(catsQ);
  const qc = useQueryClient();
  const upsertCat = useServerFn(upsertCategory);
  const delCat = useServerFn(deleteCategory);
  const upsertSub = useServerFn(upsertSubcategory);
  const delSub = useServerFn(deleteSubcategory);

  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [catForm, setCatForm] = useState<{ id?: string; name: string; slug: string } | null>(null);
  const [subForm, setSubForm] = useState<{ id?: string; category_id: string; name: string; slug: string } | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const saveCat = useMutation({
    mutationFn: () => upsertCat({ data: { id: catForm!.id, name: catForm!.name.trim(), slug: catForm!.slug || slugify(catForm!.name), sort_order: 0 } }),
    onSuccess: () => { toast.success("Saved"); setCatForm(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const saveSub = useMutation({
    mutationFn: () => upsertSub({ data: { id: subForm!.id, category_id: subForm!.category_id, name: subForm!.name.trim(), slug: subForm!.slug || slugify(subForm!.name), sort_order: 0 } }),
    onSuccess: () => { toast.success("Saved"); setSubForm(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage catalog structure.</p>
        </div>
        <Button className="rounded-none" onClick={() => setCatForm({ name: "", slug: "" })}>
          <Plus className="h-4 w-4 mr-2" /> New Category
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="border border-border bg-card">
          <div className="p-4 border-b border-border text-sm font-semibold">Categories</div>
          <ul className="divide-y divide-border">
            {data.categories.map((c) => (
              <li
                key={c.id}
                className={`p-3 flex items-center gap-2 cursor-pointer hover:bg-muted ${selectedCat === c.id ? "bg-muted" : ""}`}
                onClick={() => setSelectedCat(c.id)}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-muted-foreground">/{c.slug}</div>
                </div>
                <Button variant="outline" size="sm" className="rounded-none" onClick={(e) => { e.stopPropagation(); setCatForm({ id: c.id, name: c.name, slug: c.slug }); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${c.name}"? Products in this category will be uncategorized.`)) {
                      delCat({ data: { id: c.id } }).then(() => { toast.success("Deleted"); invalidate(); }).catch((err) => toast.error(err.message));
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-border bg-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="text-sm font-semibold">
              Subcategories {selectedCat ? `of ${data.categories.find((c) => c.id === selectedCat)?.name}` : ""}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-none"
              disabled={!selectedCat}
              onClick={() => setSubForm({ category_id: selectedCat!, name: "", slug: "" })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>
          {!selectedCat ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Select a category to see its subcategories.</div>
          ) : (
            <ul className="divide-y divide-border">
              {data.subcategories.filter((s) => s.category_id === selectedCat).map((s) => (
                <li key={s.id} className="p-3 flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">/{s.slug}</div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-none" onClick={() => setSubForm({ id: s.id, category_id: s.category_id, name: s.name, slug: s.slug })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none"
                    onClick={() => {
                      if (confirm(`Delete "${s.name}"?`)) {
                        delSub({ data: { id: s.id } }).then(() => { toast.success("Deleted"); invalidate(); }).catch((err) => toast.error(err.message));
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
              {data.subcategories.filter((s) => s.category_id === selectedCat).length === 0 && (
                <li className="p-4 text-sm text-muted-foreground text-center">No subcategories yet.</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {catForm && (
        <SimpleDialog title={catForm.id ? "Edit category" : "New category"} onClose={() => setCatForm(null)}>
          <div className="grid gap-4">
            <div>
              <Label>Name</Label>
              <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: catForm.id ? catForm.slug : slugify(e.target.value) })} className="rounded-none mt-1.5" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: slugify(e.target.value) })} className="rounded-none mt-1.5" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-none" onClick={() => setCatForm(null)}>Cancel</Button>
              <Button className="rounded-none" onClick={() => saveCat.mutate()} disabled={saveCat.isPending || !catForm.name.trim()}>
                {saveCat.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </SimpleDialog>
      )}
      {subForm && (
        <SimpleDialog title={subForm.id ? "Edit subcategory" : "New subcategory"} onClose={() => setSubForm(null)}>
          <div className="grid gap-4">
            <div>
              <Label>Name</Label>
              <Input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value, slug: subForm.id ? subForm.slug : slugify(e.target.value) })} className="rounded-none mt-1.5" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={subForm.slug} onChange={(e) => setSubForm({ ...subForm, slug: slugify(e.target.value) })} className="rounded-none mt-1.5" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-none" onClick={() => setSubForm(null)}>Cancel</Button>
              <Button className="rounded-none" onClick={() => saveSub.mutate()} disabled={saveSub.isPending || !subForm.name.trim()}>
                {saveSub.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}

function SimpleDialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4">
      <div className="bg-background border border-border w-full max-w-md">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-ink">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
