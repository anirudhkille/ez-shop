import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddressModal from "@/components/account/address-modal";
import { Edit2, Trash2 } from "lucide-react";
import {
  useAddresss,
  useDeleteAddress,
  useUpdateAddress,
} from "@/hooks/useAddress";
import type { TAddress } from "@/types/address";

export default function DeliveryAddresses() {
  const { data } = useAddresss();
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
      <div>
        <h1 className="font-semibold text-lg sm:text-xl md:text-2xl">
          Saved Delivery Addresses
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Manage your saved delivery addresses for faster checkout.
        </p>
      </div>

      {addresses?.length > 0 ? (
        <div className="space-y-4">
          {addresses?.map((a: TAddress) => (
            <Card key={a._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          You currently don't have any saved delivery addresses. Add one to be
          pre-filled during checkout.
        </p>
      )}

      <Button onClick={() => setOpen("new")} className="w-full">
        Add Address
      </Button>

      <AddressModal
        isOpen={open === "new" || open === "view"}
        onClose={() => setOpen("none")}
        address={selectedAddress}
      />
    </div>
  );
}
