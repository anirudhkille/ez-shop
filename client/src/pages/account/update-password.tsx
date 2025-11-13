import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form";
import { useUpdateProfile } from "@/hooks/useUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be minimum of 6 character"),
    newPassword: z
      .string()
      .min(6, "New password must be minimum of 6 character"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be minimum of 6 character"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password must match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password cannot be the same as the current password",
    path: ["newPassword"],
  });

export default function UpdatePassword() {
  const { mutate, isPending } = useUpdateProfile();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate({ password: data.confirmPassword });
  };

  return (
    <div className="space-y-6 max-w-sm">
      <h1 className="font-semibold text-lg sm:text-xl md:text-2xl">
        Edit Password
      </h1>

      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput
          name="currentPassword"
          label="Current Password"
          control={form.control}
        />
        <FormInput
          name="newPassword"
          label="New Password"
          control={form.control}
        />
        <FormInput
          name="confirmPassword"
          label="Confirm Password"
          control={form.control}
        />
        <Button disabled={isPending} className="w-full">
          Save
        </Button>
      </form>
    </div>
  );
}
