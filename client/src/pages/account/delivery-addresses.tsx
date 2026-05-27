import { useState } from "react";

import { ArrowLeft, Edit2, MapPin, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";

import type { TAddress } from "@/types/address";

import {
  useAddresss,
  useDeleteAddress,
  useUpdateAddress,
} from "@/hooks/useAddress";

import { Button } from "@/components/ui/button";
import AddressModal from "@/features/account/address-modal";
import Container from "@/layout/container";
import Head from "@/layout/head";

export default function DeliveryAddresses() {
  const { data } = useAddresss();
  const { mutate: deleteAddress } = useDeleteAddress();
  const { mutate: updateAddress } = useUpdateAddress();

  const addresses: TAddress[] = data?.data ?? [];

  const [open, setOpen] = useState<"none" | "new" | "edit">("none");
  const [selectedAddress, setSelectedAddress] = useState<TAddress | null>(null);

  const handleEdit = (a: TAddress) => {
    setSelectedAddress(a);
    setOpen("edit");
  };

  const handleDelete = (id: string) => {
    deleteAddress(id);
  };

  const handleSetDefault = (id: string) => {
    updateAddress({ formData: { isDefault: true }, id });
  };

  return (
    <>
      <Head title="Delivery Addresses | EZ Shop" />
      <Container className="max-w-4xl px-5 py-16 sm:px-8 md:px-10">
        <div className="mb-8">
          <Link
            to="/profile"
            className="font-body text-sm text-brand-orange hover:text-brand-orange/80 mb-4 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Profile
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <h1 className="font-display text-foreground text-3xl font-bold tracking-tight">
              Delivery Addresses
            </h1>
            <Button
              onClick={() => {
                setSelectedAddress(null);
                setOpen("new");
              }}
              className="bg-brand-orange text-white hover:bg-brand-orange/90 gap-2"
            >
              <Plus size={16} /> Add New
            </Button>
          </div>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-card border-brand-border rounded-2xl border p-16 text-center">
            <MapPin className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="font-body text-muted-foreground mb-4">
              No saved addresses yet
            </p>
            <Button
              onClick={() => setOpen("new")}
              variant="outline"
              className="gap-2"
            >
              <Plus size={16} /> Add Address
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((a) => (
              <div
                key={a._id}
                className="bg-card border-brand-border rounded-2xl border p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-body text-muted-foreground rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider dark:bg-gray-800">
                        {a.label}
                      </span>
                      {a.isDefault && (
                        <span className="bg-brand-orange/10 text-brand-orange rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-body text-foreground text-base font-semibold">
                      {a.name} — {a.phone}
                    </p>
                    <p className="font-body text-muted-foreground mt-1 text-sm">
                      {a.addressLine1}
                      {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                    </p>
                    <p className="font-body text-muted-foreground text-sm">
                      {a.city}, {a.state} - {a.zipCode}
                    </p>
                    <p className="font-body text-muted-foreground text-sm">
                      {a.country}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(a)}
                      className="border-brand-border"
                    >
                      <Edit2 size={16} />
                    </Button>
                    {!a.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(a._id ?? "")}
                        className="border-brand-border text-xs"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(a._id ?? "")}
                      className="border-brand-border text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>

      <AddressModal
        isOpen={open === "new" || open === "edit"}
        onClose={() => {
          setOpen("none");
          setSelectedAddress(null);
        }}
        address={selectedAddress}
      />
    </>
  );
}
