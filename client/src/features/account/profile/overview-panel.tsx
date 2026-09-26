import { useState } from "react";

import { Link } from "react-router";

import { Check, Pencil, X } from "lucide-react";

import useUserStore from "@/store/userStore";

import { useMyOrdersList } from "@/hooks/useOrder";
import { useProfile, useUpdateProfile } from "@/hooks/useUser";

import { OrderList } from "./order-list";
import { PanelCard, PanelHeader } from "./panel";

export default function OverviewPanel() {
  const { name, email } = useUserStore();
  const { data: profile } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { orders, isLoading: ordersLoading } = useMyOrdersList();

  const displayName = profile?.name || name || "User";
  const savedPhone = profile?.phone ?? "";

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");

  const beginEdit = () => {
    setDraftName(displayName);
    setDraftPhone(savedPhone);
    setEditing(true);
  };

  const handleSave = () => {
    updateProfile(
      { name: draftName.trim(), phone: draftPhone.trim() },
      { onSuccess: () => setEditing(false) }
    );
  };

  return (
    <>
      <PanelHeader
        title={`Welcome back, ${displayName.split(" ")[0]}`}
        subtitle="Here's what's happening with your account."
      />

      <div className="space-y-5">
        <PanelCard
          title="Personal info"
          action={
            editing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="font-body text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold"
                >
                  <X size={13} /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="bg-brand-orange text-primary-foreground font-body flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                >
                  <Check size={13} /> Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={beginEdit}
                className="font-body text-brand-orange hover:text-brand-orange/80 flex items-center gap-1 text-xs font-semibold"
              >
                <Pencil size={13} /> Edit
              </button>
            )
          }
        >
          <dl className="divide-brand-border/40 divide-y">
            <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
              <dt className="font-body text-muted-foreground text-sm">
                Display name
              </dt>
              <dd className="min-w-0 flex-1 text-right">
                {editing ? (
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    aria-label="Display name"
                    className="bg-background border-brand-border focus:border-brand-orange font-body text-foreground w-full rounded-lg border px-3 py-1.5 text-right text-sm focus:outline-none"
                  />
                ) : (
                  <span className="font-body text-foreground text-sm font-medium">
                    {displayName}
                  </span>
                )}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="font-body text-muted-foreground text-sm">
                Phone number
                <span className="font-body text-muted-foreground/70 block text-xs">
                  Used for delivery updates
                </span>
              </dt>
              <dd className="min-w-0 flex-1 text-right">
                {editing ? (
                  <input
                    type="tel"
                    value={draftPhone}
                    onChange={(e) => setDraftPhone(e.target.value)}
                    aria-label="Phone number"
                    className="bg-background border-brand-border focus:border-brand-orange font-body text-foreground w-full rounded-lg border px-3 py-1.5 text-right text-sm focus:outline-none"
                  />
                ) : savedPhone ? (
                  <span className="font-body text-foreground text-sm font-medium">
                    {savedPhone}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={beginEdit}
                    className="font-body text-brand-orange text-sm font-semibold"
                  >
                    + Add phone
                  </button>
                )}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="font-body text-muted-foreground text-sm">
                Email
                <span className="font-body text-muted-foreground/70 block text-xs">
                  Used for order updates and receipts
                </span>
              </dt>
              <dd className="font-body text-foreground truncate text-sm font-medium">
                {profile?.email || email}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
              <dt className="font-body text-muted-foreground text-sm">
                Member since
              </dt>
              <dd className="font-body text-foreground text-sm font-medium">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </dd>
            </div>
          </dl>
        </PanelCard>

        <PanelCard
          title="Recent orders"
          action={
            <Link
              to="/account/orders"
              className="font-body text-brand-orange hover:text-brand-orange/80 text-xs font-semibold"
            >
              View all →
            </Link>
          }
        >
          <OrderList
            orders={orders.slice(0, 2)}
            isLoading={ordersLoading}
            compact
          />
        </PanelCard>
      </div>
    </>
  );
}
