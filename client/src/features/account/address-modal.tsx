import { useEffect } from "react";

import { useForm } from "react-hook-form";

import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import type { TAddress } from "@/types/address";

import { usePostAddress, useUpdateAddress } from "@/hooks/useAddress";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput, FormSelect } from "@/components/ui/form";

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
  addressLine2: z.string().min(1, "Address Line 2 can't be empty"),
  zipCode: z.string().min(1, "zip code can't be empty"),
  state: z.string().min(1, ""),
  city: z.string().min(1, ""),
  country: z.string().min(1, ""),
  isDefault: z.boolean(),
});

export default function AddressModal({
  isOpen,
  onClose,
  address,
}: AddressModalProps) {
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

  const onSubmit = (data: TAddress) => {
    if (address) {
      update({
        id: address._id || "",
        formData: data,
      });
    } else {
      create(data);
    }

    onClose();
  };

  useEffect(() => {
    if (address) form.reset(address);
    else form.reset();
  }, [open]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95dvh] max-w-md overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new delivery address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <FormSelect
              name="label"
              label="Address Type"
              control={form.control}
              options={[
                { label: "Home", value: "Home" },
                { label: "Work", value: "Work" },
                { label: "Others", value: "Others" },
              ]}
            />
            <div className="grid gap-x-5 sm:grid-cols-2">
              <FormInput name="name" label="Name" control={form.control} />
              <FormInput
                name="phone"
                label="Phone Number"
                control={form.control}
              />
            </div>
            <FormInput
              name="addressLine1"
              label="Address Line 1"
              control={form.control}
            />
            <FormInput
              name="addressLine2"
              label="Address Line 2"
              control={form.control}
            />
            <div className="grid gap-x-5 sm:grid-cols-2">
              <FormInput name="city" label="City" control={form.control} />
              <FormInput name="state" label="State" control={form.control} />
            </div>
            <div className="grid gap-x-5 sm:grid-cols-2">
              <FormInput
                name="zipCode"
                label="Zip Code"
                control={form.control}
              />
              <FormInput
                name="country"
                label="Country"
                control={form.control}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Address</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
