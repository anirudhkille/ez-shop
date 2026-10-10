import type { ReactNode } from "react";

import { Mail, Phone, User } from "lucide-react";

import {
  AddressAutocompleteCombobox,
  type TResolvedAddressFields,
} from "@/features/account";

import { guestErrors } from "../lib/guest-validation";
import type { GuestDetails } from "../types";

const inputClass =
  "bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-xl border py-3 text-sm transition-colors focus:outline-none";

function Label({
  htmlFor,
  children,
  required: isRequired,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-body text-foreground mb-1.5 block text-xs font-semibold tracking-[0.18em] uppercase"
    >
      {children} {isRequired && <span className="text-red-500">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="text-destructive mt-1.5 text-xs">
      {message}
    </p>
  );
}

function IconInput({
  id,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  id: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <div className="relative">
        <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`${inputClass} pr-4 pl-9`}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

type Props = {
  guest: GuestDetails;
  onChange: (field: keyof GuestDetails, value: string) => void;
  showErrors: boolean;
};

export function GuestContactForm({ guest, onChange, showErrors }: Props) {
  const contactErrors = showErrors ? guestErrors(guest, "contact") : {};
  const addressErrors = showErrors ? guestErrors(guest, "address") : {};

  const onSelectAddress = (resolved: TResolvedAddressFields) => {
    onChange("addressLine1", resolved.addressLine1);
    if (resolved.city) onChange("city", resolved.city);
    if (resolved.state) onChange("state", resolved.state);
    if (resolved.zipCode) onChange("zipCode", resolved.zipCode);
    if (resolved.country) onChange("country", resolved.country);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="guest-name" required>
          Full Name
        </Label>
        <IconInput
          id="guest-name"
          icon={<User size={14} />}
          value={guest.name}
          onChange={(v) => onChange("name", v)}
          placeholder="John Doe"
          error={contactErrors.name}
        />
      </div>

      <div>
        <Label htmlFor="guest-email" required>
          Email
        </Label>
        <IconInput
          id="guest-email"
          type="email"
          icon={<Mail size={14} />}
          value={guest.email}
          onChange={(v) => onChange("email", v)}
          placeholder="john@example.com"
          error={contactErrors.email}
        />
      </div>

      <div>
        <Label htmlFor="guest-phone" required>
          Phone
        </Label>
        <IconInput
          id="guest-phone"
          icon={<Phone size={14} />}
          value={guest.phone}
          onChange={(v) => onChange("phone", v)}
          placeholder="+91 98765 43210"
          error={contactErrors.phone}
        />
      </div>

      <div className="border-brand-border pt-4">
        <p className="font-body text-muted-foreground mb-4 text-xs font-semibold tracking-[0.18em] uppercase">
          Delivery Address
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="guest-line1" required>
              Address Line 1
            </Label>
            <AddressAutocompleteCombobox
              id="guest-line1"
              value={guest.addressLine1}
              onChange={(v) => onChange("addressLine1", v)}
              onSelectAddress={onSelectAddress}
              placeholder="123 Main Street"
              invalid={Boolean(addressErrors.addressLine1)}
              className="rounded-xl py-3"
            />
            <FieldError message={addressErrors.addressLine1} />
          </div>

          <div>
            <Label htmlFor="guest-line2">Address Line 2</Label>
            <input
              id="guest-line2"
              value={guest.addressLine2}
              onChange={(e) => onChange("addressLine2", e.target.value)}
              placeholder="Apartment, suite, etc."
              className={`${inputClass} px-4`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guest-city" required>
                City
              </Label>
              <input
                id="guest-city"
                value={guest.city}
                onChange={(e) => onChange("city", e.target.value)}
                placeholder="Mumbai"
                aria-invalid={Boolean(addressErrors.city)}
                className={`${inputClass} px-4`}
              />
              <FieldError message={addressErrors.city} />
            </div>
            <div>
              <Label htmlFor="guest-state" required>
                State
              </Label>
              <input
                id="guest-state"
                value={guest.state}
                onChange={(e) => onChange("state", e.target.value)}
                placeholder="Maharashtra"
                aria-invalid={Boolean(addressErrors.state)}
                className={`${inputClass} px-4`}
              />
              <FieldError message={addressErrors.state} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guest-zip" required>
                ZIP Code
              </Label>
              <input
                id="guest-zip"
                value={guest.zipCode}
                onChange={(e) => onChange("zipCode", e.target.value)}
                placeholder="400001"
                aria-invalid={Boolean(addressErrors.zipCode)}
                className={`${inputClass} px-4`}
              />
              <FieldError message={addressErrors.zipCode} />
            </div>
            <div>
              <Label htmlFor="guest-country" required>
                Country
              </Label>
              <input
                id="guest-country"
                value={guest.country}
                onChange={(e) => onChange("country", e.target.value)}
                placeholder="India"
                aria-invalid={Boolean(addressErrors.country)}
                className={`${inputClass} px-4`}
              />
              <FieldError message={addressErrors.country} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
