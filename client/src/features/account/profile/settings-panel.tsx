import type { FC, ReactNode } from "react";

import { Link, useNavigate } from "react-router";

import {
  ChevronRight,
  Lock,
  LogOut,
  type LucideIcon,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import type { TAddress } from "@/types/address";

import useUserStore from "@/store/userStore";

import { useAddresss } from "@/hooks/useAddress";
import { useProfile } from "@/hooks/useUser";

import { PanelHeader } from "./panel";

const SettingsGroup: FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <div>
    <h2 className="font-body text-muted-foreground mb-3 text-sm font-medium">
      {title}
    </h2>
    <div className="border-brand-border divide-brand-border divide-y overflow-hidden rounded-2xl border">
      {children}
    </div>
  </div>
);

const SettingsRow: FC<{
  icon: LucideIcon;
  label: string;
  value?: string | null;
  hint?: string;
  to?: string;
  onClick?: () => void;
  tone?: "danger";
}> = ({ icon: Icon, label, value, hint, to, onClick, tone }) => {
  const body = (
    <>
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
          tone === "danger"
            ? "bg-destructive/10 text-destructive"
            : "bg-brand-surface-raised text-muted-foreground"
        }`}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`font-body block text-sm font-medium ${
            tone === "danger" ? "text-destructive" : "text-foreground"
          }`}
        >
          {label}
        </span>
        {hint ? (
          <span className="font-body text-muted-foreground mt-0.5 block text-xs">
            {hint}
          </span>
        ) : null}
      </span>
      {value ? (
        <span className="font-body text-muted-foreground shrink-0 text-sm">
          {value}
        </span>
      ) : null}
      {to ? <ChevronRight size={16} className="shrink-0" aria-hidden /> : null}
    </>
  );

  const className =
    "hover:bg-brand-surface-raised/60 flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors";

  if (to) {
    return (
      <Link to={to} className={className}>
        {body}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }

  return <div className="flex items-center gap-4 px-4 py-3.5">{body}</div>;
};

export default function SettingsPanel() {
  const { name, email, logout } = useUserStore();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: addressResponse } = useAddresss();

  const addresses = (addressResponse?.data ?? []) as TAddress[];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <PanelHeader
        title="Settings"
        subtitle="Manage your account, addresses and security."
      />

      <div className="max-w-2xl space-y-8">
        <SettingsGroup title="Account">
          <SettingsRow icon={User} label="Name" value={profile?.name || name} />
          <SettingsRow
            icon={Mail}
            label="Email"
            value={profile?.email || email || ""}
            hint="Used for order updates and receipts."
          />
          <SettingsRow
            icon={Phone}
            label="Phone"
            value={profile?.phone || "Not added"}
            hint="Helps delivery updates reach you."
          />
        </SettingsGroup>

        <SettingsGroup title="Shopping">
          <SettingsRow
            icon={MapPin}
            label="Addresses"
            value={
              addresses.length === 0
                ? "None saved"
                : `${addresses.length} saved`
            }
            hint="Where your orders get delivered."
            to="/account/addresses"
          />
        </SettingsGroup>

        <SettingsGroup title="Security">
          <SettingsRow
            icon={Lock}
            label="Password"
            value="Change"
            hint="Use a password you do not use anywhere else."
            to="/account/password"
          />
        </SettingsGroup>

        <SettingsGroup title="Session">
          <SettingsRow
            icon={LogOut}
            label="Log out"
            hint="You will need to log in again."
            onClick={handleLogout}
            tone="danger"
          />
        </SettingsGroup>
      </div>
    </>
  );
}
