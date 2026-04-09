import { Link } from "react-router";

import { ArrowLeft, CreditCard, ShieldAlert } from "lucide-react";

export default function ErrorPage() {
  return (
    <main className="pt-24 pb-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="bg-card border-brand-border rounded-[2rem] border p-8 text-center lg:p-12">
          <div className="bg-destructive/10 mx-auto flex h-18 w-18 items-center justify-center rounded-full">
            <ShieldAlert className="text-destructive h-9 w-9" />
          </div>
          <h1 className="font-display text-foreground mt-6 text-4xl font-black uppercase">
            Payment was not completed
          </h1>
          <p className="font-body text-muted-foreground mx-auto mt-4 max-w-xl text-sm leading-6">
            Your Stripe checkout was cancelled or failed before the payment
            could be confirmed. Your cart is still available, so you can review
            the order and try again.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/checkout"
              className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90"
            >
              <CreditCard size={16} />
              Retry Checkout
            </Link>
            <Link
              to="/cart"
              className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/40 hover:text-foreground inline-flex items-center gap-2 rounded-full border px-7 py-4 text-sm tracking-wider uppercase transition-all"
            >
              <ArrowLeft size={16} />
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
