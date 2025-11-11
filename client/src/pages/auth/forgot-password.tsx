import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form";
import { useForgotPassword } from "@/hooks/useUser";
import AuthLayout from "@/layout/AuthLayout";
import Head from "@/layout/Head";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
});

export default function ForgotPassword() {
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
    <>
      <Head
        title="Forgot Password | EZ Shop"
        description="Trouble logging in? Enter your email to reset your password and regain access to your EZ Shop account."
      />

      <AuthLayout
        title="Forgot password"
        description="Enter your email address below and we'll send you otp to reset your password"
        redirect="/login"
        redirectText=" Remember your password? Login"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="Enter your email"
          />

          <Button className="w-full" type="submit" disabled={isPending}>
            Reset password
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
