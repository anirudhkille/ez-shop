import { Link, NavLink, Outlet, useNavigate } from "react-router";

import {
  Heart,
  LogOut,
  type LucideIcon,
  Package,
  Settings,
  User,
} from "lucide-react";

import type { TAddress } from "@/types/address";

import useUserStore from "@/store/userStore";

import { useAddresss } from "@/hooks/useAddress";
import { useMyOrders } from "@/hooks/useOrder";
import { useProfile } from "@/hooks/useUser";
import { useWishlistDetails } from "@/hooks/useWishlist";

import {
  type ProfileView,
  profileViewPath,
} from "@/features/account/profile/types";

type NavItem = {
  view: ProfileView;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { view: "overview", label: "Overview", icon: User },
  { view: "orders", label: "Orders", icon: Package },
  { view: "saved", label: "Wishlist", icon: Heart },
  { view: "settings", label: "Settings", icon: Settings },
];

function StatLink({
  to,
  value,
  label,
}: {
  to: string;
  value: number;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="hover:border-brand-border bg-brand-surface-raised rounded-lg px-2 py-2 text-center transition-colors"
    >
      <span className="font-display text-foreground block text-base font-bold">
        {value}
      </span>
      <span className="font-body text-muted-foreground block text-[11px]">
        {label}
      </span>
    </Link>
  );
}

export default function Profile() {
  const { name, email, logout } = useUserStore();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: ordersData } = useMyOrders();
  const { data: wishlistData } = useWishlistDetails();
  const { data: addressResponse } = useAddresss();

  const addresses = (addressResponse?.data ?? []) as TAddress[];
  const wishlistCount = wishlistData?.products?.length ?? 0;
  // The rail shows lifetime totals, so read the server's count rather than the
  // number of rows loaded so far.
  const orderCount = ordersData?.pages[0]?.pagination?.total ?? 0;

  const displayName = profile?.name || name || "User";
  const avatarInitial = (displayName[0] ?? email?.[0] ?? "?").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <main className="pt-24 pb-20">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-10">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[272px_1fr]">
          {/* Side rail */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="bg-card border-brand-border rounded-2xl border p-5">
              <div className="flex items-center gap-3.5">
                <div className="bg-brand-surface-raised flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-brand-orange text-lg font-black">
                      {avatarInitial}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-foreground truncate text-base font-bold">
                    {displayName}
                  </p>
                  <p className="font-body text-muted-foreground truncate text-xs">
                    {profile?.email || email}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <StatLink
                  to={profileViewPath("orders")}
                  value={orderCount}
                  label="Orders"
                />
                <StatLink
                  to={profileViewPath("saved")}
                  value={wishlistCount}
                  label="Wishlist"
                />
                <StatLink
                  to={profileViewPath("settings")}
                  value={addresses.length}
                  label="Address"
                />
              </div>
            </div>

            <nav
              aria-label="Account sections"
              className="bg-card border-brand-border mt-4 flex gap-1 overflow-x-auto rounded-2xl border p-1.5 lg:flex-col lg:overflow-visible"
            >
              {navItems.map(({ view, label, icon: Icon }) => (
                <NavLink
                  key={view}
                  to={profileViewPath(view)}
                  end={view === "overview"}
                  className={({ isActive }) =>
                    `font-body relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-brand-orange/10 text-brand-orange"
                        : "text-muted-foreground hover:bg-brand-surface-raised hover:text-foreground"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <span
                          className="bg-brand-orange absolute top-2 bottom-2 left-0 hidden w-[3px] rounded-full lg:block"
                          aria-hidden
                        />
                      ) : null}
                      <Icon size={16} className="shrink-0" aria-hidden />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}

              <span
                className="bg-brand-border my-1 hidden h-px shrink-0 lg:block"
                aria-hidden
              />

              <button
                type="button"
                onClick={handleLogout}
                className="font-body text-destructive hover:bg-destructive/10 flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
              >
                <LogOut size={16} className="shrink-0" aria-hidden />
                Log out
              </button>
            </nav>
          </aside>

          {/* Route-driven panel */}
          <div className="animate-fade-in-up min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}
