import { MapPin, Plus } from "lucide-react";

import type { TAddress } from "@/features/account";

type Props = {
  addresses: TAddress[];
  selectedAddressId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
};

const cardClass = (selected: boolean) =>
  selected
    ? "border-brand-orange bg-brand-orange/8 shadow-[0_18px_50px_-35px_rgba(255,122,24,0.8)]"
    : "border-brand-border hover:border-brand-orange/35 hover:bg-brand-surface-raised/40";

export function AddressPicker({
  addresses,
  selectedAddressId,
  onSelect,
  onAdd,
}: Props) {
  if (addresses.length === 0) {
    return (
      <div className="border-brand-border bg-brand-surface-raised/30 rounded-2xl border border-dashed p-8 text-center">
        <MapPin className="text-brand-orange mx-auto h-9 w-9" />
        <h3 className="font-display text-foreground mt-4 text-2xl font-black uppercase">
          Add an address to continue
        </h3>
        <p className="font-body text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
          Checkout needs a delivery address before we can calculate shipping and
          payment options.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-[background-color,transform] duration-150 active:scale-[0.98]"
        >
          <Plus size={14} />
          Add Address
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => {
        const isSelected = address._id === selectedAddressId;

        return (
          <label
            key={address._id}
            className={`block cursor-pointer rounded-3xl border p-5 transition-colors duration-150 ${cardClass(isSelected)}`}
          >
            <div className="flex items-start gap-4">
              <input
                type="radio"
                name="address"
                checked={isSelected}
                onChange={() => onSelect(address._id ?? "")}
                className="accent-brand-orange mt-1 h-4 w-4"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-body text-foreground text-sm font-semibold tracking-[0.18em] uppercase">
                    {address.label}
                  </p>
                  {address.isDefault && (
                    <span className="bg-brand-orange text-primary-foreground rounded-xl px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Default
                    </span>
                  )}
                </div>
                <p className="font-body text-foreground mt-3 text-base font-semibold">
                  {address.name}
                </p>
                <p className="font-body text-muted-foreground mt-2 text-sm leading-6">
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                  <br />
                  {address.city}, {address.state} {address.zipCode}
                  <br />
                  {address.country}
                </p>
                <p className="font-body text-muted-foreground mt-2 text-sm">
                  {address.phone}
                </p>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
