import { useMemo, useRef, useState } from "react";

import { Link, useNavigate } from "react-router";

import {
  Calendar,
  Camera,
  ChevronRight,
  Edit3,
  Heart,
  Lock,
  LogOut,
  type LucideIcon,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";

import type { TAddress } from "@/types/address";
import type { TProduct } from "@/types/product";

import { formatPrice } from "@/lib/formatPrice";

import useUserStore from "@/store/userStore";

import { useAddresss } from "@/hooks/useAddress";
import { useMyOrders } from "@/hooks/useOrder";
import { useUpdateProfile } from "@/hooks/useUser";
import { useToggleWishlist, useWishlistDetails } from "@/hooks/useWishlist";

const tabs = ["Overview", "Orders", "Wishlist", "Settings"] as const;
type Tab = (typeof tabs)[number];

const statusColor: Record<string, string> = {
  Delivered: "text-green-400 bg-green-400/10 border-green-400/20",
  Shipped: "text-brand-orange bg-brand-orange/10 border-brand-orange/20",
  Processing: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

interface OrderDoc {
  _id: string;
  createdAt: string;
  orderStatus: string;
  products?: unknown[];
  totalAmount: number;
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-body text-muted-foreground mb-3 text-sm font-medium">
        {title}
      </h2>
      <div className="border-brand-border divide-brand-border divide-y overflow-hidden rounded-2xl border">
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  hint,
  to,
  onClick,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  to?: string;
  onClick?: () => void;
  tone?: "danger";
}) {
  const body = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          tone === "danger"
            ? "text-destructive bg-destructive/10"
            : "text-muted-foreground bg-brand-surface-raised"
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
      {to ? (
        <ChevronRight
          size={16}
          className="text-muted-foreground shrink-0"
          aria-hidden
        />
      ) : null}
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
}

export default function Profile() {
  const { name, email, logout } = useUserStore();
  const navigate = useNavigate();
  const { data: orders } = useMyOrders();
  const { data: wishlistData } = useWishlistDetails();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { mutate: updateProfile } = useUpdateProfile();

  const wishlistProducts: TProduct[] = wishlistData?.products ?? [];

  const displayName = name || "User";

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    displayName: displayName,
    phone: "",
    gender: "",
    dob: "",
  });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: addressResponse } = useAddresss();
  const addresses = useMemo(
    () => (addressResponse?.data ?? []) as TAddress[],
    [addressResponse]
  );

  const handleSave = () => {
    updateProfile({ name: form.displayName });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatarInitial = (displayName[0] ?? email?.[0] ?? "?").toUpperCase();

  return (
    <div className="text-foreground">
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-10">
          {/* Profile hero */}
          <div className="bg-card border-brand-border relative mb-8 overflow-hidden rounded-3xl border">
            <div className="from-brand-orange/20 via-brand-orange/5 h-32 bg-gradient-to-r to-transparent" />

            <div className="-mt-12 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:px-8">
              <div className="relative shrink-0">
                <div className="border-background bg-brand-surface-raised flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4">
                  <span className="font-display text-brand-orange text-4xl font-black">
                    {avatarInitial}
                  </span>
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="bg-brand-orange absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-xl shadow-lg transition-[background-color,transform] duration-150 active:scale-[0.98]"
                >
                  <Camera size={14} className="text-primary-foreground" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-foreground text-3xl font-black uppercase">
                    {displayName}
                  </h1>
                </div>
                <p className="font-body text-muted-foreground mt-1 text-sm">
                  {email}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={handleLogout}
                  className="border-brand-border font-body text-muted-foreground hover:border-destructive/40 hover:text-destructive flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors duration-200"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>

            <div className="border-brand-border divide-brand-border grid grid-cols-3 divide-x border-t">
              {[
                { label: "Orders", value: orders?.length ?? 0 },
                { label: "Wishlist", value: wishlistProducts.length },
                { label: "Reviews", value: 0 },
              ].map((s) => (
                <div key={s.label} className="py-4 text-center">
                  <p className="font-display text-foreground text-2xl font-bold">
                    {s.value}
                  </p>
                  <p className="font-body text-muted-foreground mt-0.5 text-xs">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-card border-brand-border mb-8 flex gap-1 overflow-x-auto rounded-2xl border p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-body flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200 sm:flex-none ${
                  activeTab === tab
                    ? "bg-brand-orange text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          {activeTab === "Overview" && (
            <div className="animate-fade-in-up grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-card border-brand-border rounded-2xl border p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display text-foreground text-xl font-bold uppercase">
                    Personal Info
                  </h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="font-body text-brand-orange hover:text-brand-orange/80 flex items-center gap-1.5 text-sm transition-colors"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(false)}
                        className="font-body text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
                      >
                        <X size={14} /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="bg-brand-orange text-primary-foreground font-body flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-[background-color,transform] duration-150 active:scale-[0.98]"
                      >
                        <Save size={14} /> Save
                      </button>
                    </div>
                  )}
                </div>

                {saved && (
                  <p className="font-body mb-4 text-xs text-green-400">
                    Profile updated successfully
                  </p>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="font-body text-muted-foreground mb-1.5 flex items-center gap-2 text-xs tracking-wider uppercase">
                      <User size={11} /> Display Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={form.displayName}
                        onChange={(e) =>
                          setForm({ ...form, displayName: e.target.value })
                        }
                        className="bg-background border-brand-border font-body text-foreground focus:border-brand-orange w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none"
                      />
                    ) : (
                      <p className="font-body text-foreground text-sm">
                        {displayName || (
                          <span className="text-muted-foreground italic">
                            Not set
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-body text-muted-foreground mb-1.5 flex items-center gap-2 text-xs tracking-wider uppercase">
                      <Phone size={11} /> Phone
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        className="bg-background border-brand-border font-body text-foreground focus:border-brand-orange w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none"
                      />
                    ) : (
                      <p className="font-body text-foreground text-sm">
                        {form.phone || (
                          <span className="text-muted-foreground italic">
                            Not set
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-body text-muted-foreground mb-1.5 flex items-center gap-2 text-xs tracking-wider uppercase">
                      <Calendar size={11} /> Date of Birth
                    </label>
                    {editing ? (
                      <input
                        type="date"
                        value={form.dob}
                        onChange={(e) =>
                          setForm({ ...form, dob: e.target.value })
                        }
                        className="bg-background border-brand-border font-body text-foreground focus:border-brand-orange w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none"
                      />
                    ) : (
                      <p className="font-body text-foreground text-sm">
                        {form.dob || (
                          <span className="text-muted-foreground italic">
                            Not set
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-body text-muted-foreground mb-1.5 flex items-center gap-2 text-xs tracking-wider uppercase">
                      <User size={11} /> Gender
                    </label>
                    {editing ? (
                      <select
                        value={form.gender}
                        onChange={(e) =>
                          setForm({ ...form, gender: e.target.value })
                        }
                        className="bg-background border-brand-border font-body text-foreground focus:border-brand-orange w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none"
                      >
                        <option value="">Prefer not to say</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                      </select>
                    ) : (
                      <p className="font-body text-foreground text-sm">
                        {form.gender || (
                          <span className="text-muted-foreground italic">
                            Not set
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-body text-muted-foreground mb-1.5 flex items-center gap-2 text-xs tracking-wider uppercase">
                      <Mail size={11} /> Email
                    </label>
                    <p className="font-body text-foreground text-sm">{email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border-brand-border rounded-2xl border p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display text-foreground text-xl font-bold uppercase">
                    Recent Order
                  </h2>
                  <button
                    onClick={() => setActiveTab("Orders")}
                    className="font-body text-brand-orange hover:text-brand-orange/80 text-sm transition-colors"
                  >
                    View all
                  </button>
                </div>
                {(orders ?? []).slice(0, 2).map((order: OrderDoc) => (
                  <div
                    key={order._id}
                    className="border-brand-border/50 flex items-center justify-between border-b py-4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-surface-raised flex h-10 w-10 items-center justify-center rounded-xl">
                        <Package size={18} className="text-brand-orange" />
                      </div>
                      <div>
                        <p className="font-body text-foreground text-sm font-semibold">
                          #{order._id?.slice(-6).toUpperCase()}
                        </p>
                        <p className="font-body text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                          {order.products?.length ?? 0} item
                          {(order.products?.length ?? 0) > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-brand-orange text-base font-bold">
                        {formatPrice(order.totalAmount)}
                      </p>
                      <span
                        className={`font-body rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColor[order.orderStatus] || "text-muted-foreground border-brand-border"}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
                {(!orders || orders.length === 0) && (
                  <p className="font-body text-muted-foreground py-8 text-center text-sm">
                    No orders yet
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "Orders" && (
            <div className="animate-fade-in-up space-y-4">
              {(orders ?? []).length === 0 ? (
                <div className="py-16 text-center">
                  <Package
                    size={48}
                    className="text-muted-foreground/30 mx-auto mb-4"
                  />
                  <p className="font-body text-muted-foreground">
                    No orders found
                  </p>
                  <Link
                    to="/products"
                    className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                (orders ?? []).map((order: OrderDoc) => (
                  <div
                    key={order._id}
                    className="bg-card border-brand-border hover:border-brand-orange/30 flex flex-col items-start gap-4 rounded-2xl border p-5 transition-colors sm:flex-row sm:items-center"
                  >
                    <div className="bg-brand-surface-raised flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                      <Package size={22} className="text-brand-orange" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-foreground text-lg font-bold">
                          #{order._id?.slice(-6).toUpperCase()}
                        </h3>
                        <span
                          className={`font-body rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusColor[order.orderStatus] || "text-muted-foreground border-brand-border"}`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="font-body text-muted-foreground text-sm">
                        {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                        {order.products?.length ?? 0} item
                        {(order.products?.length ?? 0) > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-display text-brand-orange text-xl font-bold">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-muted-foreground"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "Wishlist" && (
            <div className="animate-fade-in-up grid grid-cols-2 gap-4 md:grid-cols-4">
              {wishlistProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <Heart
                    size={48}
                    className="text-muted-foreground/30 mx-auto mb-4"
                  />
                  <p className="font-body text-muted-foreground">
                    Your wishlist is empty
                  </p>
                  <Link
                    to="/products"
                    className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                wishlistProducts.map((p: TProduct) => (
                  <div
                    key={p._id}
                    className="group bg-card border-brand-border hover:border-brand-orange/40 relative overflow-hidden rounded-2xl border transition-[border-color,transform] duration-200 hover:-translate-y-1"
                  >
                    <button
                      onClick={() => toggleWishlist(p._id)}
                      className="bg-background/80 absolute top-3 right-3 z-10 rounded-full p-1.5"
                    >
                      <Heart size={14} className="fill-red-500 text-red-500" />
                    </button>
                    <Link to={`/${p.slug}/${p._id}`}>
                      <div className="bg-brand-surface-raised flex aspect-square items-center justify-center p-6">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-full w-full object-contain transition-transform duration-200 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="p-4">
                        <p className="font-display text-foreground truncate text-sm font-bold">
                          {p.name}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-display text-brand-orange font-bold">
                            {formatPrice(p.discountPrice || p.price)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "Settings" && (
            <div className="max-w-2xl space-y-10">
              <SettingsGroup title="Account">
                <SettingsRow icon={User} label="Name" value={displayName} />
                <SettingsRow
                  icon={Mail}
                  label="Email"
                  value={email ?? ""}
                  hint="Used for order updates and receipts."
                />
                <SettingsRow
                  icon={Phone}
                  label="Phone"
                  value={phone || "Not added"}
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
                  to="/account/delivery-addresses"
                />
              </SettingsGroup>

              <SettingsGroup title="Security">
                <SettingsRow
                  icon={Lock}
                  label="Password"
                  value="Change"
                  hint="Use a password you do not use anywhere else."
                  to="/account/update-password"
                />
              </SettingsGroup>

              <SettingsGroup title="Session">
                <SettingsRow
                  icon={LogOut}
                  label="Sign out"
                  value=""
                  hint="You will need to sign in again."
                  onClick={handleLogout}
                  tone="danger"
                />
              </SettingsGroup>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
