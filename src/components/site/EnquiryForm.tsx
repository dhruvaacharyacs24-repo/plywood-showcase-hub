import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitEnquiry } from "@/lib/enquiries.functions";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(5, "Phone is required").max(30),
  email: z.string().trim().email("Invalid email").max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(2000),
});
type FormValues = z.infer<typeof schema>;

export function EnquiryForm({
  productId,
  productName,
  onSuccess,
}: {
  productId?: string;
  productName?: string;
  onSuccess?: () => void;
}) {
  const submit = useServerFn(submitEnquiry);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: productName ? `I'd like to enquire about ${productName}.` : "",
    },
  });
  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      submit({
        data: {
          ...values,
          product_id: productId ?? null,
          product_name: productName ?? null,
        },
      }),
    onSuccess: () => {
      toast.success("Enquiry sent! We'll get back to you soon.");
      reset();
      onSuccess?.();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to send enquiry"),
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input id="name" {...register("name")} className="rounded-none mt-1.5" />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" type="tel" {...register("phone")} className="rounded-none mt-1.5" />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} className="rounded-none mt-1.5" />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea id="message" rows={4} {...register("message")} className="rounded-none mt-1.5" />
        {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
      </div>
      <Button type="submit" size="lg" className="rounded-none w-full sm:w-auto" disabled={mutation.isPending}>
        {mutation.isPending ? "Sending..." : "Send Enquiry"}
      </Button>
    </form>
  );
}
