import { Check, Pencil, X } from "lucide-react";

import { useProfileForm } from "../hooks/use-profile-form";
import { PanelCard } from "./panel";

export function ProfileCard() {
  const {
    form,
    isEditing,
    isPending,
    displayName,
    savedPhone,
    email,
    memberSince,
    beginEdit,
    cancel,
    save,
  } = useProfileForm();

  const fieldClass =
    "bg-background border-brand-border focus:border-brand-orange font-body text-foreground w-full rounded-lg border px-3 py-1.5 text-right text-sm focus:outline-none";

  return (
    <PanelCard
      title="Personal info"
      action={
        isEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancel}
              className="font-body text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold"
            >
              <X size={13} /> Cancel
            </button>
            <button
              type="button"
              onClick={save}
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
      <form onSubmit={save}>
        <dl className="divide-brand-border/40 divide-y">
          <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
            <dt className="font-body text-muted-foreground text-sm">
              Display name
            </dt>
            <dd className="min-w-0 flex-1 text-right">
              {isEditing ? (
                <input
                  type="text"
                  aria-label="Display name"
                  className={fieldClass}
                  {...form.register("name")}
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
              {isEditing ? (
                <input
                  type="tel"
                  aria-label="Phone number"
                  className={fieldClass}
                  {...form.register("phone")}
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
              {email}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
            <dt className="font-body text-muted-foreground text-sm">
              Member since
            </dt>
            <dd className="font-body text-foreground text-sm font-medium">
              {memberSince
                ? new Date(memberSince).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </dd>
          </div>
        </dl>
      </form>
    </PanelCard>
  );
}
