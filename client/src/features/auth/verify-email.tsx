import { useEffect, useRef, useState } from "react";

import { useLocation } from "react-router";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { useVerifySignupOTP } from "@/hooks/useUser";

import { Button } from "@/components/ui/button";

const formSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function VerifyEmailForm() {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [code, setCode] = useState<string[]>(Array(6).fill(""));

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

  const autoVerify = (otp: string) => {
    if (isPending || !email) return;

    onSubmit({ otp });
  };

  const handleChange = (idx: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;

    const next = [...code];
    next[idx] = val;
    setCode(next);

    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }

    const fullOtp = next.join("");

    if (fullOtp.length === 6 && /^\d{6}$/.test(fullOtp)) {
      autoVerify(fullOtp);
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (code[idx]) {
        const next = [...code];
        next[idx] = "";
        setCode(next);
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const pasted = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(pasted)) return;

    const digits = pasted.split("");
    setCode(digits);

    inputsRef.current[5]?.focus();

    autoVerify(pasted);
  };

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  console.log(isPending);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fullOtp = code.join("");

        if (fullOtp.length === 6) {
          onSubmit({ otp: fullOtp });
        }
      }}
      className="mt-10 space-y-6"
    >
      <div className="flex justify-between gap-2" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`font-display bg-card text-foreground h-14 w-12 rounded-xl border text-center text-2xl font-bold transition-all duration-200 outline-none ${
              digit
                ? "border-brand-orange"
                : "border-brand-border focus:border-brand-orange/60"
            }`}
          />
        ))}
      </div>

      {form.formState.errors.otp && (
        <p className="text-center text-sm text-red-500">
          {form.formState.errors.otp.message}
        </p>
      )}

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
