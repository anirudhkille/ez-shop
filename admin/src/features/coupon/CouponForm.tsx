"use client";

import React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientFetch } from "@/lib/client-api";
import { ICoupon } from "@/types";

interface CouponFormProps {
  data?: ICoupon | null;
}

// Numeric inputs stay strings in the form so the resolver's input and output
// types line up. Parsing happens in onSubmit; ranges are checked here.
const optionalNumber = z
  .string()
  .optional()
  .refine(
    (value) =>
      value === undefined ||
      value === "" ||
      (Number.isFinite(Number(value)) && Number(value) > 0),
    { message: "Must be a number greater than 0" },
  );

const formSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, { message: "Code must be at least 2 characters" })
      .max(32, { message: "Code must be at most 32 characters" })
      .regex(/^[A-Za-z0-9_-]+$/, {
        message: "Only letters, numbers, - and _ are allowed",
      }),
    type: z.enum(["percentage", "fixed"]),
    value: z
      .string()
      .min(1, { message: "Value is required" })
      .refine((raw) => Number.isFinite(Number(raw)) && Number(raw) > 0, {
        message: "Must be a number greater than 0",
      }),
    description: z.string().optional(),
    minOrderValue: optionalNumber,
    maxDiscountAmount: optionalNumber,
    maxUses: optionalNumber,
    maxUsesPerUser: optionalNumber,
    expiresAt: z.string().optional(),
    active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.type === "percentage" && Number(values.value) > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Percentage cannot exceed 100",
      });
    }

    if (values.type === "fixed" && values.maxUsesPerUser) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxUsesPerUser"],
        message: "Per-user limit only applies to percentage coupons",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "");

const toNumber = (value?: string) =>
  value === undefined || value === "" ? undefined : Number(value);

export default function CouponForm({ data }: CouponFormProps) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: data?.code || "",
      type: data?.type || "percentage",
      value: data ? String(data.value) : "",
      description: data?.description || "",
      minOrderValue: data?.minOrderValue != null ? String(data.minOrderValue) : "",
      maxDiscountAmount:
        data?.maxDiscountAmount != null ? String(data.maxDiscountAmount) : "",
      maxUses: data?.maxUses != null ? String(data.maxUses) : "",
      maxUsesPerUser:
        data?.maxUsesPerUser != null ? String(data.maxUsesPerUser) : "",
      expiresAt: toDateInput(data?.expiresAt),
      active: data?.active ?? true,
    },
  });

  const watchType = form.watch("type");

  // The server rejects a per-user limit on fixed coupons, so clear it rather
  // than letting the user fill it in and then hit an error.
  React.useEffect(() => {
    if (watchType === "fixed") {
      form.setValue("maxUsesPerUser", "");
      form.setValue("maxDiscountAmount", "");
    }
  }, [watchType, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: Record<string, unknown> = {
        type: values.type,
        value: Number(values.value),
        active: values.active,
      };

      if (values.description) payload.description = values.description;

      const minOrderValue = toNumber(values.minOrderValue);
      if (minOrderValue !== undefined) payload.minOrderValue = minOrderValue;

      const maxDiscountAmount = toNumber(values.maxDiscountAmount);
      if (maxDiscountAmount !== undefined)
        payload.maxDiscountAmount = maxDiscountAmount;

      const maxUses = toNumber(values.maxUses);
      if (maxUses !== undefined) payload.maxUses = maxUses;

      const maxUsesPerUser = toNumber(values.maxUsesPerUser);
      if (maxUsesPerUser !== undefined)
        payload.maxUsesPerUser = maxUsesPerUser;

      if (values.expiresAt)
        payload.expiresAt = new Date(values.expiresAt).toISOString();

      // Code is immutable after creation so an issued code never changes meaning.
      if (!data) payload.code = values.code.toUpperCase();

      const response = await clientFetch(
        data ? `/api/coupon/${data._id}` : "/api/coupon",
        {
          method: data ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/coupon");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="SUMMER20"
                  disabled={!!data}
                  className="font-mono uppercase"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {data
                  ? "The code cannot be changed after creation."
                  : "Customers type this at checkout. Letters and numbers only."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">Percentage off</SelectItem>
                  <SelectItem value="fixed">Fixed amount off</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {watchType === "percentage" ? "Percentage" : "Amount"}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  placeholder={watchType === "percentage" ? "10" : "500"}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {watchType === "percentage"
                  ? "Percentage to take off the order subtotal (max 100)."
                  : "Flat amount in rupees to take off the order subtotal."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Monsoon sale" {...field} />
              </FormControl>
              <FormDescription>
                Internal note. Never shown to customers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minOrderValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum order value</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="999" {...field} />
              </FormControl>
              <FormDescription>Leave blank for no minimum.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchType === "percentage" ? (
          <>
            <FormField
              control={form.control}
              name="maxDiscountAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum discount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Caps what a large order can take off. Leave blank for no cap.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxUsesPerUser"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uses per customer</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Leave blank to allow repeat use. Not enforced for guest
                    checkout, which has no customer identity.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : null}

        <FormField
          control={form.control}
          name="maxUses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total usage limit</FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="100" {...field} />
              </FormControl>
              <FormDescription>
                Leave blank for unlimited redemptions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expires on</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>Leave blank for no expiry.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Inactive coupons are rejected at checkout.
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </Form>
  );
}
