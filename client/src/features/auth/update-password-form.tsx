import { type ReactNode, useState } from "react";

import { type Control, useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Check, Eye, EyeOff, Lock, ShieldCheck, X } from "lucide-react";

import { getErrorMessage } from "@/lib/apiError";

import { useUpdatePassword } from "@/hooks/useUser";

import { Button } from "@/components/ui/button";
import { FormInputWithIcon, FormLabel } from "@/components/ui/form";

const formSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Enter your current password" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

/**
 * Advisory only — the server is the authority on password policy. These give
 * the user feedback before submitting rather than after a round trip.
 */
const requirements = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "case",
    label: "Upper and lower case letters",
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  {
    id: "number",
    label: "A number",
    test: (value: string) => /\d/.test(value),
  },
];

const strengthMeta = [
  { label: "", bar: "bg-transparent", text: "text-transparent" },
  { label: "Too weak", bar: "bg-destructive", text: "text-destructive" },
  { label: "Too weak", bar: "bg-destructive", text: "text-destructive" },
  { label: "Fair", bar: "bg-amber-400", text: "text-amber-400" },
  { label: "Strong", bar: "bg-green-400", text: "text-green-400" },
];

/** Password field with a show/hide toggle, matching the auth form styling. */
function PasswordField({
  control,
  name,
  placeholder,
  icon,
  autoComplete,
}: {
  control: Control<FormValues>;
  name: "currentPassword" | "newPassword" | "confirmPassword";
  placeholder: string;
  icon: ReactNode;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <FormInputWithIcon
        control={control}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        icon={icon}
        autoComplete={autoComplete}
        className="rounded-xl pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function UpdatePasswordForm() {
  const { mutate: updatePassword, isPending } = useUpdatePassword();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Watched rather than read from an onChange prop: FormInput spreads caller
  // props after react-hook-form's `field`, so an onChange would replace the
  // field registration and silently break the form.
  const newPassword = form.watch("newPassword");
  const score = requirements.filter((rule) => rule.test(newPassword)).length;
  const strength = strengthMeta[score];

  const onSubmit = (values: FormValues) => {
    updatePassword(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password updated");
          form.reset();
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Could not update your password"));
        },
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <FormLabel htmlFor="currentPassword">Current password</FormLabel>
        <PasswordField
          control={form.control}
          name="currentPassword"
          placeholder="Enter your current password"
          icon={<Lock size={16} />}
          autoComplete="current-password"
        />
      </div>

      <div className="space-y-1.5">
        <FormLabel htmlFor="newPassword">New password</FormLabel>
        <PasswordField
          control={form.control}
          name="newPassword"
          placeholder="At least 8 characters"
          icon={<ShieldCheck size={16} />}
          autoComplete="new-password"
        />

        {newPassword ? (
          <div className="pt-2">
            <div className="flex items-center gap-1.5" aria-hidden>
              {requirements.map((rule, index) => (
                <span
                  key={rule.id}
                  className={`h-1 flex-1 rounded-full ${
                    index < score ? strength.bar : "bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>

            <p
              className={`font-body mt-2 text-[11px] font-semibold tracking-wider uppercase ${strength.text}`}
            >
              {strength.label}
            </p>

            <ul className="mt-2 space-y-1">
              {requirements.map((rule) => {
                const met = rule.test(newPassword);

                return (
                  <li
                    key={rule.id}
                    className={`font-body flex items-center gap-1.5 text-xs ${
                      met ? "text-green-400" : "text-muted-foreground"
                    }`}
                  >
                    {met ? (
                      <Check size={12} aria-hidden />
                    ) : (
                      <X size={12} aria-hidden />
                    )}
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <FormLabel htmlFor="confirmPassword">Confirm new password</FormLabel>
        <PasswordField
          control={form.control}
          name="confirmPassword"
          placeholder="Re-enter your new password"
          icon={<ShieldCheck size={16} />}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full rounded-xl">
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
