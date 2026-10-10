import { Link } from "react-router";

import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

import type { TAddress } from "@/features/account";

import { type GuestDetails } from "../types";
import { AddressPicker } from "./address-picker";
import { GuestContactForm } from "./guest-contact-form";

type Props = {
  isActive: boolean;
  isSignedIn: boolean;
  accountName?: string | null;
  accountEmail?: string | null;
  addresses: TAddress[];
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onOpenAddressModal: () => void;
  guest: GuestDetails;
  onGuestChange: (field: keyof GuestDetails, value: string) => void;
  showGuestErrors: boolean;
  canContinue: boolean;
  onContinue: () => void;
};

export function StepContact({
  isActive,
  isSignedIn,
  accountName,
  accountEmail,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onOpenAddressModal,
  guest,
  onGuestChange,
  showGuestErrors,
  canContinue,
  onContinue,
}: Props) {
  return (
    <section
      className={`bg-card border-brand-border rounded-[1.75rem] border p-6 transition-opacity lg:p-8 ${
        isActive ? "" : "hidden"
      }`}
      aria-hidden={!isActive}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-body text-brand-orange text-xs font-semibold tracking-[0.24em] uppercase">
            Step 1
          </p>
          <h2 className="font-display text-foreground mt-1 text-3xl font-black uppercase">
            {isSignedIn ? "Delivery Address" : "Contact & Address"}
          </h2>
        </div>
        {isSignedIn && (
          <button
            type="button"
            onClick={onOpenAddressModal}
            className="border-brand-border text-muted-foreground hover:border-brand-orange/40 hover:text-foreground inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase transition-colors duration-150"
          >
            <Plus size={14} />
            Add Address
          </button>
        )}
      </div>

      {isSignedIn ? (
        <>
          <div className="border-brand-border bg-brand-surface-raised/40 mb-6 rounded-2xl border border-dashed p-4">
            <p className="font-body text-foreground text-sm font-semibold">
              Signed in as {accountName || "EZ Shop customer"}
            </p>
            <p className="font-body text-muted-foreground mt-1 text-sm">
              {accountEmail || "Email unavailable"}
            </p>
          </div>

          <AddressPicker
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelect={onSelectAddress}
            onAdd={onOpenAddressModal}
          />
        </>
      ) : (
        <GuestContactForm
          guest={guest}
          onChange={onGuestChange}
          showErrors={showGuestErrors}
        />
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/cart"
          className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/40 hover:text-foreground inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm tracking-wider uppercase transition-colors duration-150"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </Link>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue to Delivery
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
