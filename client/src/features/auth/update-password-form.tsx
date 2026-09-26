import { type ReactNode, useState } from "react";

import { type Control, useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

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
