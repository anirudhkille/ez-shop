import { useState } from "react";

import { useNavigate } from "react-router";

import { Edit2, MapPin, Plus, Trash2 } from "lucide-react";

import type { TAddress } from "@/types/address";

import {
  useAddresss,
  useDeleteAddress,
  useUpdateAddress,
} from "@/hooks/useAddress";

import { Button } from "@/components/ui/button";

import AddressModal from "../account/address-modal";

type ShippingAddressProps = {
  goToNextStep: () => void;
};

export default function Address({ goToNextStep }: ShippingAddressProps) {
  const { data } = useAddresss();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState<TAddress | null>(null);
  const [open, setOpen] = useState<"none" | "new" | "view">("none");
  const { mutate: deleteAddress } = useDeleteAddress();
  const { mutate: updateAddress } = useUpdateAddress();

  const handleSetDefault = (id: string) => {
    updateAddress({ formData: { isDefault: true }, id });
  };

  const handleDelete = (id: string) => {
    deleteAddress(id);
  };

  const handleEdit = (a: TAddress) => {
    setSelectedAddress(a);
    setOpen("view");
  };

  const addresses = data?.data;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Shipping Information</h2>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Shipping Address
          </h3>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen("new")}
            className="text-foreground hover:text-foreground/80 gap-1 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>

        {
          <div className="space-y-3">
            {addresses?.length === 0 ? (
              <div className="border-border rounded-lg border border-dashed p-6 text-center">
                <MapPin className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                <p className="text-muted-foreground mb-3">No saved addresses</p>
                <Button
                  variant="outline"
                  onClick={() => setOpen("new")}
                  className="gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add Address
                </Button>
              </div>
            ) : (
              addresses?.map((a: TAddress) => (
                <label
                  key={a._id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    selectedAddress?._id === a._id
                      ? "border-foreground bg-muted/50"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedAddress"
                    value={a._id}
                    checked={selectedAddress === a}
                    onChange={() => {
                      setSelectedAddress(a);
                      navigate(`?address=${a._id}`);
                    }}
                    className="accent-foreground mt-1 h-4 w-4"
                  />

                  <div className="flex w-full items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold">
                          {a.label} Address
                        </p>
                        {a.isDefault && (
                          <span className="bg-primary rounded px-2 py-0.5 text-xs text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm">
                        {a.name} — {a.phone}
                      </p>
                      <p className="text-sm">
                        {a?.addressLine1}, {a?.addressLine2}
                      </p>
                      <p className="text-sm">
                        {a?.city}, {a?.state} - {a?.zipCode}
                      </p>
                      <p className="text-sm">{a?.country}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(a)}
                        variant="outline"
                        size="sm"
                        className="border-border"
                      >
                        <Edit2 size={16} />
                      </Button>
                      {!a.isDefault && (
                        <Button
                          onClick={() => handleSetDefault(a._id ?? "")}
                          variant="outline"
                          size="sm"
                          className="border-border"
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(a._id ?? "")}
                        variant="outline"
                        size="sm"
                        className="border-border text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        }
      </div>

      <Button
        onClick={goToNextStep}
        disabled={!selectedAddress}
        className="bg-foreground text-background hover:bg-foreground/90 w-full rounded-full py-6 text-base disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue to Payment
      </Button>

      <AddressModal
        isOpen={open === "new" || open === "view"}
        onClose={() => setOpen("none")}
        address={selectedAddress}
      />
    </div>
  );
}
