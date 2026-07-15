import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Mail, Phone, Trash2 } from "lucide-react";
import { deleteEnquiry, listEnquiries, markEnquiryRead } from "@/lib/enquiries.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const enqQ = queryOptions({ queryKey: ["admin", "enquiries"], queryFn: () => listEnquiries() });

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(enqQ);
  },
  component: AdminEnquiries,
});

function AdminEnquiries() {
  const { data: enquiries } = useSuspenseQuery(enqQ);
  const qc = useQueryClient();
  const markRead = useServerFn(markEnquiryRead);
  const del = useServerFn(deleteEnquiry);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const items = filter === "unread" ? enquiries.filter((e) => !e.is_read) : enquiries;

  const mark = useMutation({
    mutationFn: (v: { id: string; is_read: boolean }) => markRead({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "enquiries"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "enquiries"] }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">Submissions from the website contact and product forms.</p>
        </div>
        <div className="flex border border-border">
          <button
            onClick={() => setFilter("all")}
            className={cn("px-4 py-2 text-sm font-medium", filter === "all" ? "bg-primary text-primary-foreground" : "bg-background")}
          >
            All ({enquiries.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn("px-4 py-2 text-sm font-medium border-l border-border", filter === "unread" ? "bg-primary text-primary-foreground" : "bg-background")}
          >
            Unread ({enquiries.filter((e) => !e.is_read).length})
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {items.length === 0 && (
          <div className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No enquiries.
          </div>
        )}
        {items.map((e) => (
          <div key={e.id} className={cn("border bg-card p-5", !e.is_read ? "border-primary" : "border-border")}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold">{e.name}</h3>
                  {!e.is_read && <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest">New</span>}
                  {e.product_name && <span className="text-xs text-muted-foreground">re: {e.product_name}</span>}
                </div>
                <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                  <a href={`tel:${e.phone}`} className="flex items-center gap-1 hover:text-primary">
                    <Phone className="h-3 w-3" /> {e.phone}
                  </a>
                  {e.email && (
                    <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-primary">
                      <Mail className="h-3 w-3" /> {e.email}
                    </a>
                  )}
                  <span>{new Date(e.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={() => mark.mutate({ id: e.id, is_read: !e.is_read })}
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> {e.is_read ? "Mark unread" : "Mark read"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={() => { if (confirm("Delete this enquiry?")) remove.mutate(e.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-soft whitespace-pre-line">{e.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
