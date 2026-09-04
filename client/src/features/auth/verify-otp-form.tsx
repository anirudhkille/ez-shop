import { useLocation } from "react-router";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { KeyRound } from "lucide-react";

import { useVerifySignupOTP } from "@/hooks/useUser";

import { Button } from "@/components/ui/button";
import { FormInputWithIcon, FormLabel } from "@/components/ui/form";

const formSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export default function VerifyOtpForm() {
  const location = useLocation();
  const email = location.state?.email;

  const { mutate, isPending } = useVerifySignupOTP();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!email) return;

    mutate({
      email,
      otp: data.otp,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <FormLabel htmlFor="otp">OTP</FormLabel>
        <FormInputWithIcon
          control={form.control}
          name="otp"
          placeholder="Enter 6-digit OTP"
          className="rounded-md py-3"
          icon={<KeyRound size={16} />}
        />
      </div>

      <Button
        className="w-full rounded-md hover:scale-100"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Verifying..." : "Verify OTP"}
      </Button>
    </form>
  );
}