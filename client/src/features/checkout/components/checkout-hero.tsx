export function CheckoutHero() {
  return (
    <div className="mb-10">
      <span className="font-body text-brand-orange text-xs font-semibold tracking-[0.32em] uppercase">
        Secure Checkout
      </span>
      <h1 className="font-display text-foreground mt-2 text-5xl font-black uppercase lg:text-6xl">
        Complete Your <span className="text-gradient-orange">Order</span>
      </h1>
      <p className="font-body text-muted-foreground mt-3 max-w-2xl text-sm leading-6 sm:text-base">
        Review your delivery details, choose a payment option, and finish your
        order in one clean flow.
      </p>
    </div>
  );
}
