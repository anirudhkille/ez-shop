import { useNavigate } from "react-router";

import { Controller, useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { useSignup } from "@/hooks/useUser";

import AuthLayout from "@/layout/auth-layout";
import Head from "@/layout/head";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FormInput } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name can't be empty",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(1, {
    message: "Password can't be empty",
  }),
});

export default function Login() {
  const navigate = useNavigate();
  const { mutate, isPending } = useSignup();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };

  return (
    <>
      <Head
        title="Create an Account | EZ Shop"
        description="Join EZ Shop today! Create your account by entering your email, password, and other details. Start enjoying personalized features and more."
      />
      <AuthLayout
        title="Create an account"
        description="Enter your details to create a new account"
        redirect="/login"
        redirectText="Already have an account? Login"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            control={form.control}
            name="name"
            label="Name"
            placeholder="Enter your name"
          />

          <FormInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="Enter your email"
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Button
                    onClick={() => navigate("/forgot-password")}
                    variant="link"
                    type="button"
                  >
                    Forgot password?
                  </Button>
                </div>
                <div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button className="w-full" type="submit" disabled={isPending}>
            Signup
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
