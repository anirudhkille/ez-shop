import { ArrowLeft, ArrowRight } from "lucide-react";

import type { TDeliveryMethod } from "@/features/order";
import { formatPrice } from "@/shared/lib/formatPrice";
import type { TAddress } from "@/shared/types/address";

import { DELIVERY_OPTIONS, type GuestDetails } from "../types";

type Props = {
  isActive: boolean;
  isSignedIn: boolean;
  selectedDeliveryMethod: TDeliveryMethod;
  onSelectDeliveryMethod: (method: TDeliveryMethod) => void;
  selectedAddress?: TAddress;
  guest: GuestDetails;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
};

/** The one-line "delivering to" recap, shared by step 2 and the summary. */
export function ShippingTarget({
  isSignedIn,
  selectedAddress,
  guest,
  heading,
}: {
  isSignedIn: boolean;
  selectedAddress?: TAddress;
  guest: GuestDetails;
  heading: string;
}) {
  if (!(selectedAddress ?? (!isSignedIn && guest.addressLine1))) return null;

  return (
    <div className="bg-brand-surface-raised/40 border-brand-border mt-6 rounded-2xl border p-4">
      <p className="font-body text-foreground text-xs font-semibold tracking-[0.18em] uppercase">
        {heading}
      </p>
      {isSignedIn && selectedAddress ? (
        <p className="font-body text-muted-foreground mt-2 text-sm leading-6">
          {selectedAddress.name}, {selectedAddress.addressLine1}
          {selectedAddress.addressLine2
            ? `, ${selectedAddress.addressLine2}`
            : ""}
          , {selectedAddress.city}, {selectedAddress.state}{" "}
          {selectedAddress.zipCode}
        </p>
      ) : (
        <p className="font-body text-muted-foreground mt-2 text-sm leading-6">
          {guest.name}, {guest.addressLine1}
          {guest.addressLine2 ? `, ${guest.addressLine2}` : ""}, {guest.city},{" "}
          {guest.state} {guest.zipCode}
        </p>
      )}
    </div>
  );
}

export function StepDelivery({
  isActive,
  isSignedIn,
  selectedDeliveryMethod,
  onSelectDeliveryMethod,
  selectedAddress,
  guest,
  canContinue,
  onBack,
  onContinue,
}: Props) {
  return (
    <section
      className={`bg-card border-brand-border rounded-[1.75rem] border p-6 transition-opacity lg:p-8 ${
        isActive ? "" : "hidden"
      }`}
      aria-hidden={!isActive}
    >
      <div className="mb-6">
        <p className="font-body text-brand-orange text-xs font-semibold tracking-[0.24em] uppercase">
          Step 2
        </p>
        <h2 className="font-display text-foreground mt-1 text-3xl font-black uppercase">
          Delivery Method
        </h2>
      </div>

      <div className="space-y-4">
        {DELIVERY_OPTIONS.map((option) => {
          const isSelected = option.id === selectedDeliveryMethod;

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
                  name="deliveryMethod"
                  checked={isSelected}
                  onChange={() => onSelectDeliveryMethod(option.id)}
                  className="accent-brand-orange mt-1 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-body text-foreground text-sm font-semibold tracking-[0.18em] uppercase">
                        {option.title}
                      </p>
                      <p className="font-body text-muted-foreground mt-2 text-sm">
                        {option.description}
                      </p>
                    </div>
                    <span className="font-display text-brand-orange text-2xl font-black">
                      {option.price === 0 ? "Free" : formatPrice(option.price)}
                    </span>
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <ShippingTarget
        isSignedIn={isSignedIn}
        selectedAddress={selectedAddress}
        guest={guest}
        heading="Delivering to"
      />

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
          onClick={onContinue}
          disabled={!canContinue}
          className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue to Payment
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
