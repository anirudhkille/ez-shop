import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { Mail } from "lucide-react";

import { useForgotPassword } from "@/hooks/useUser";

import { Button } from "@/components/ui/button";
import { FormInputWithIcon, FormLabel } from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
});

export default function ForgotPasswordForm() {
  const { mutate, isPending } = useForgotPassword();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data.email);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-4">
      <div className="space-y-1">
        <FormLabel htmlFor="email">Email</FormLabel>
        <FormInputWithIcon
          control={form.control}
          name="email"
          placeholder="Enter your email"
          className="rounded-md py-3"
          icon={<Mail size={16} />}
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
