import { Plus, Trash2, MapPin, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAddresss,
  useDeleteAddress,
  useUpdateAddress,
} from "@/hooks/useAddress";
import type { TAddress } from "@/types/address";
import { useState } from "react";
import AddressModal from "../account/address-modal";
import { useNavigate } from "react-router";

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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Shipping Address
          </h3>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen("new")}
            className="text-sm text-foreground hover:text-foreground/80 gap-1"
          >
            <Plus className="w-4 h-4" />
            Add New
          </Button>
        </div>

        {/* Address Selection Mode */}
        {
          <div className="space-y-3">
            {addresses?.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground mb-3">No saved addresses</p>
                <Button
                  variant="outline"
                  onClick={() => setOpen("new")}
                  className="gap-2 bg-transparent"
                >
                  <Plus className="w-4 h-4" />
                  Add Address
                </Button>
              </div>
            ) : (
              addresses?.map((a: TAddress) => (
                <label
                  key={a._id}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
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
                    className="w-4 h-4 mt-1 accent-foreground"
                  />

                  <div className="flex justify-between items-start w-full">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base">
                          {a.label} Address
                        </p>
                        {a.isDefault && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-3">
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
        className="w-full rounded-full py-6 text-base bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
