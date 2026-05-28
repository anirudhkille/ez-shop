import { useSearchParams } from "react-router";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { Lock } from "lucide-react";

import { useResetPassword } from "@/hooks/useUser";

import { Button } from "@/components/ui/button";
import { FormInputWithIcon, FormLabel } from "@/components/ui/form";

const formSchema = z
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

export default function ResetPasswordForm() {
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-4">
      <div className="space-y-1">
        <FormLabel htmlFor="newPassword">New Password</FormLabel>
        <FormInputWithIcon
          control={form.control}
          type="password"
          name="newPassword"
          placeholder="Enter new password"
          className="rounded-md py-3"
          icon={<Lock size={16} />}
        />
      </div>

      <div className="space-y-1">
        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
        <FormInputWithIcon
          control={form.control}
          type="password"
          name="confirmPassword"
          placeholder="Enter confirm password"
          className="rounded-md py-3"
          icon={<Lock size={16} />}
        />
      </div>

      <Button
        className="w-full rounded-md hover:scale-100"
        type="submit"
        disabled={isPending}
      >
        Forgot password
      </Button>
    </form>
  );
}
