import { useSearchParams } from "react-router";

import { Controller, useForm } from "react-hook-form";

import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { useResetPassword } from "@/hooks/useUser";

import AuthLayout from "@/layout/auth-layout";
import Head from "@/layout/head";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function TResetPassword() {
  const { mutate, isPending } = useResetPassword();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate({ token: token ?? "", password: data.confirmPassword });
  };

  return (
    <>
      <Head
        title="Reset Password | EZ Shop"
        description="Reset your EZ Shop password securely. Enter your new password to update your account and regain access."
      />
      <AuthLayout
        title="Reset password"
        description="Enter a new password for your account."
        redirect="/forgot-password"
        redirectText="Back to reset password"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={form.control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>

                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  {...field}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>

                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Enter your confirm password"
                  {...field}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
