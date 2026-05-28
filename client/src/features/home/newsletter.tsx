import { useForm } from "react-hook-form";

import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { ArrowRight, CheckCircle, Mail } from "lucide-react";

import { useSubscribeNewsletter } from "@/hooks/useNewsletter";

import Fade from "@/components/shared/fade";
import { Button } from "@/components/ui/button";
import { FormInputWithIcon } from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email",
  }),
});

export default function Newsletter() {
  return (
    <section className="bg-card/40 py-24">
      <div className="mx-auto max-w-350 px-6 lg:px-10">
        <Fade className="bg-card border-brand-border relative overflow-hidden rounded-3xl border p-8 md:p-16">
          <div className="bg-brand-orange/6 pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full blur-[100px]" />
          <div className="bg-brand-orange/4 pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full blur-[80px]" />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <span className="font-display text-foreground/[0.018] text-[160px] leading-none font-black uppercase select-none">
              EZ SHOP
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="bg-brand-orange/10 border-brand-orange/30 text-brand-orange font-body mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                <Mail size={12} />
                Newsletter
              </div>
              <h2 className="font-display text-foreground text-4xl leading-[0.95] font-black uppercase md:text-5xl">
                JOIN THE
                <br />
                <span className="text-gradient-orange">INNER CIRCLE</span>
              </h2>
              <p className="font-body text-muted-foreground mx-auto mt-4 max-w-md text-base leading-relaxed lg:mx-0">
                Get early access to new drops, exclusive discounts, and training
                tips from pro athletes. No spam, ever.
              </p>

              <div className="mt-6 flex flex-col gap-4 text-left sm:flex-row">
                {[
                  "10% off first order",
                  "Early access drops",
                  "Exclusive content",
                ].map((perk) => (
                  <div key={perk} className="flex items-center gap-2">
                    <CheckCircle
                      size={14}
                      className="text-brand-orange shrink-0"
                    />
                    <span className="font-body text-muted-foreground text-xs">
                      {perk}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <NewsletterForm />
          </div>
        </Fade>
      </div>
    </section>
  );
}

function NewsletterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const subscribe = useSubscribeNewsletter();

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    subscribe.mutate(data.email);
  };

  return (
    <div className="w-full max-w-md flex-1">
      {subscribe.isSuccess ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle size={48} className="text-brand-orange" />
          <h3 className="font-display text-foreground text-2xl font-bold">
            You're in!
          </h3>
          <p className="font-body text-muted-foreground text-sm">
            Stay tuned for exclusive updates and offers.
          </p>
        </div>
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <FormInputWithIcon
            control={form.control}
            name="email"
            placeholder="Enter your email"
            icon={<Mail size={16} />}
          />

          <Button type="submit">
            Subscribe Now
            <ArrowRight size={16} />
          </Button>
          <p className="font-body text-muted-foreground/60 text-center text-[11px]">
            By subscribing, you agree to our Privacy Policy. Unsubscribe
            anytime.
          </p>
        </form>
      )}
    </div>
  );
}
