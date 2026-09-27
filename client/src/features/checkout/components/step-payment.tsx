import { ArrowLeft, CheckCircle2, CreditCard, Lock, Truck } from "lucide-react";

import { formatPrice } from "@/shared/lib/formatPrice";

import {
  DELIVERY_OPTIONS,
  PAYMENT_OPTIONS,
  type PaymentMethod,
} from "../types";

type Props = {
  isActive: boolean;
  selectedPaymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  selectedDeliveryMethod: string;
  total: number;
  isSubmitting: boolean;
  canSubmit: boolean;
  onBack: () => void;
  onSubmit: () => void;
};

export function StepPayment({
  isActive,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  selectedDeliveryMethod,
  total,
  isSubmitting,
  canSubmit,
  onBack,
  onSubmit,
}: Props) {
  const deliveryTitle = DELIVERY_OPTIONS.find(
    (option) => option.id === selectedDeliveryMethod
  )?.title;

  return (
    <section
      className={`bg-card border-brand-border rounded-[1.75rem] border p-6 transition-opacity lg:p-8 ${
        isActive ? "" : "hidden"
      }`}
      aria-hidden={!isActive}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-body text-brand-orange text-xs font-semibold tracking-[0.24em] uppercase">
            Step 3
          </p>
          <h2 className="font-display text-foreground mt-1 text-3xl font-black uppercase">
            Payment Method
          </h2>
        </div>
        <div className="text-muted-foreground border-brand-border inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs tracking-[0.18em] uppercase">
          <Lock size={14} />
          Encrypted
        </div>
      </div>

      <div className="space-y-4">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = option.id === selectedPaymentMethod;

          return (
            <label
              key={option.id}
              className={`block cursor-pointer rounded-3xl border p-5 transition-colors duration-150 ${
                isSelected
                  ? "border-brand-orange bg-brand-orange/8"
                  : "border-brand-border hover:border-brand-orange/35 hover:bg-brand-surface-raised/40"
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={isSelected}
                  onChange={() => onSelectPaymentMethod(option.id)}
                  className="accent-brand-orange mt-1 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {option.id === "card" ? (
                      <CreditCard className="text-brand-orange h-5 w-5" />
                    ) : (
                      <Truck className="text-brand-orange h-5 w-5" />
                    )}
                    <p className="font-body text-foreground text-sm font-semibold tracking-[0.18em] uppercase">
                      {option.title}
                    </p>
                  </div>
                  <p className="font-body text-muted-foreground mt-2 text-sm">
                    {option.description}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="bg-brand-surface-raised/40 border-brand-border mt-6 rounded-2xl border p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="text-brand-orange mt-0.5 h-5 w-5" />
          <div>
            <p className="font-body text-foreground text-sm font-semibold">
              {selectedPaymentMethod === "card"
                ? "You'll be redirected to Stripe to complete payment."
                : "Your order will be confirmed now and paid at delivery."}
            </p>
            <p className="font-body text-muted-foreground mt-2 text-sm leading-6">
              Delivery method: {deliveryTitle}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/40 hover:text-foreground inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm tracking-wider uppercase transition-colors duration-150"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Lock size={16} />
          {isSubmitting
            ? "Processing..."
            : `${selectedPaymentMethod === "card" ? "Pay" : "Place Order"} ${formatPrice(total)}`}
        </button>
      </div>
    </section>
  );
}
