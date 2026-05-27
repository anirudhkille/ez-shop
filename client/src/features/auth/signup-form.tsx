import { Link } from "react-router";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { Lock, Mail } from "lucide-react";

import {  useSignup } from "@/hooks/useUser";

import { Button } from "@/components/ui/button";
import { FormInputWithIcon, FormLabel } from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(1, {
    message: "Password can't be empty",
  }),
});

export default function SignupForm() {
  const { mutate, isPending } = useSignup();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

      <div className="space-y-1">
        <div className="flex justify-between">
          <FormLabel htmlFor="password">Password</FormLabel>
          <Link
            to="/forgot-password"
            className="font-body text-brand-orange hover:text-brand-orange/80 text-xs transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <FormInputWithIcon
          control={form.control}
          type="password"
          name="password"
          placeholder="Enter your password"
          className="rounded-md py-3"
          icon={<Lock size={16} />}
        />
      </div>

      <Button
        className="w-full rounded-md hover:scale-100"
        type="submit"
        disabled={isPending}
      >
        Login
      </Button>
    </form>
  );
}
