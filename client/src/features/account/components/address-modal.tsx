import { useEffect } from "react";

import { Controller, useForm } from "react-hook-form";

import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import type { TAddress, TResolvedAddressFields } from "@/features/account";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { FormInput, FormSelect } from "@/shared/components/ui/form";

import { usePostAddress, useUpdateAddress } from "../hooks/use-address";
import { AddressAutocompleteInput } from "./address-autocomplete-input";

type AddressModalProps = {
  isOpen: boolean;
  onClose: () => void;
  address?: TAddress | null;
};

const formSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]),
  name: z.string().min(1, "Name can't be empty"),
  phone: z.string().min(1, "Mobile Number can't be empty"),
  addressLine1: z.string().min(1, "Address Line 1 can't be empty"),
  addressLine2: z.string().optional(),
  zipCode: z.string().min(1, "Zip code can't be empty"),
  state: z.string().min(1, "State can't be empty"),
  city: z.string().min(1, "City can't be empty"),
  country: z.string().min(1, "Country can't be empty"),
  isDefault: z.boolean(),
});

export function AddressModal({ isOpen, onClose, address }: AddressModalProps) {
  const { mutate: create } = usePostAddress();
  const { mutate: update } = useUpdateAddress();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "Home",
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      zipCode: "",
      state: "",
      city: "",
      country: "",
      isDefault: false,
    },
  });

  const handleSuccess = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: TAddress) => {
    if (address) {
      update(
        {
          id: address._id || "",
          formData: data,
        },
        { onSuccess: handleSuccess }
      );
    } else {
      create(data, { onSuccess: handleSuccess });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    form.reset(
      address
        ? { ...address, addressLine2: address.addressLine2 ?? "" }
        : undefined
    );
  }, [address, form, isOpen]);

  const onSelectAddress = ({
    addressLine1,
    city,
    state,
    zipCode,
    country,
  }: TResolvedAddressFields) => {
    const apply = (
      field: "addressLine1" | "city" | "state" | "zipCode" | "country",
      value: string
    ) => {
      if (value.trim()) {
        form.setValue(field, value, { shouldValidate: true });
      }
    };

    apply("addressLine1", addressLine1);
    apply("city", city);
    apply("state", state);
    apply("zipCode", zipCode);
    apply("country", country);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-brand-border bg-card max-h-[95dvh] max-w-md overflow-y-auto rounded-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-display text-foreground text-xl tracking-wide">
              {address ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new delivery address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormSelect
              name="label"
              label="Address Type"
              control={form.control}
              className="font-body rounded-xl"
              options={[
                { label: "Home", value: "Home" },
                { label: "Work", value: "Work" },
                { label: "Other", value: "Other" },
              ]}
            />
            <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
              <FormInput
                name="name"
                label="Name"
                className="rounded-xl"
                control={form.control}
              />
              <FormInput
                name="phone"
                label="Phone Number"
                className="rounded-xl"
                control={form.control}
              />
            </div>
            <AddressAutocompleteInput
              name="addressLine1"
              label="Address Line 1"
              control={form.control}
              onSelectAddress={onSelectAddress}
              className="rounded-xl"
            />
            <FormInput
              name="addressLine2"
              label="Address Line 2"
              optional
              className="rounded-xl"
              control={form.control}
            />
            <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
              <FormInput
                name="city"
                label="City"
                className="rounded-xl"
                control={form.control}
              />
              <FormInput
                name="state"
                label="State"
                className="rounded-xl"
                control={form.control}
              />
            </div>
            <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
              <FormInput
                name="zipCode"
                label="Zip Code"
                className="rounded-xl"
                control={form.control}
              />
              <FormInput
                name="country"
                label="Country"
                className="rounded-xl"
                control={form.control}
              />
            </div>
            <Controller
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="accent-brand-orange size-4"
                  />
                  <span className="font-body text-foreground text-sm">
                    Set as default delivery address
                  </span>
                </label>
              )}
            />
          </div>

          <DialogFooter className="border-brand-border gap-3 border-t pt-5">
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl">
              {address ? "Save Changes" : "Save Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
