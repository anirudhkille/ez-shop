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
  onSearch: (orderId: string) => void;
}

export function TrackOrderForm({ isLoading, onSearch }: TrackOrderFormProps) {
  const form = useForm<z.infer<typeof trackSchema>>({
    resolver: zodResolver(trackSchema),
    defaultValues: { orderId: "" },
  });

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
          className="bg-background mt-2 w-full"
        />
        {form.formState.errors.orderId && (
          <p className="font-body mt-1.5 text-xs text-red-400">
            {form.formState.errors.orderId.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="bg-brand-orange hover:bg-brand-orange/90 mt-4 w-full text-white"
      >
        {isLoading ? "Searching..." : "Track Package"}
      </Button>
    </form>
  );
}
