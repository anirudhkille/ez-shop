import { useEffect } from "react";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/components/ui/button";
import { FormInput, FormLabel } from "@/shared/components/ui/form";

const trackSchema = z.object({
  orderId: z.string().trim().min(1, "Enter your Order ID"),
});

interface TrackOrderFormProps {
  isLoading: boolean;
  defaultOrderId?: string;
  onSearch: (orderId: string) => void;
}

export function TrackOrderForm({
  isLoading,
  defaultOrderId = "",
  onSearch,
}: TrackOrderFormProps) {
  const form = useForm<z.infer<typeof trackSchema>>({
    resolver: zodResolver(trackSchema),
    defaultValues: { orderId: defaultOrderId },
  });

  useEffect(() => {
    form.reset({ orderId: defaultOrderId });
  }, [defaultOrderId, form]);

  const onSubmit = form.handleSubmit((values) => onSearch(values.orderId));

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <FormLabel htmlFor="order-id">Order ID</FormLabel>
        <FormInput
          id="order-id"
          control={form.control}
          name="orderId"
          placeholder="Paste your Order ID here"
          className="mt-2 w-full rounded-xl"
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full rounded-xl">
        {isLoading ? "Searching…" : "Track Package"}
      </Button>
    </form>
  );
}
