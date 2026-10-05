import { Link } from "react-router";

import { LogOut, ShoppingCart, User } from "lucide-react";

interface ProfileMenuProps {
  name: string | null;
  email: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileMenu({
  name,
  email,
  isOpen,
  onToggle,
  onClose,
  onLogout,
}: ProfileMenuProps) {
  if (!email) {
    return (
      <Link
        to="/login"
        aria-label="Login"
        className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150"
      >
        <User size={18} />
      </Link>
    );
  }

  const initial = name?.[0] ?? email?.[0] ?? "";

  return (
    <>
      <button
        onClick={onToggle}
        aria-label="Account menu"
        aria-expanded={isOpen}
        className="bg-brand-orange/10 border-brand-orange/30 font-display text-brand-orange hover:bg-brand-orange/20 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black uppercase transition-colors duration-150"
      >
        {initial}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="bg-card border-brand-border absolute top-12 right-0 z-50 w-52 overflow-hidden rounded-2xl border shadow-[0_20px_60px_-10px_hsl(0_0%_0%/0.8)]">
            <div className="border-brand-border border-b px-4 py-3">
              <p className="font-body text-foreground truncate text-sm font-semibold">
                {name}
              </p>
              <p className="font-body text-muted-foreground truncate text-xs">
                {email}
              </p>
            </div>
            <div className="py-1.5">
              <Link
                to="/account"
                className="font-body text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
              >
                <User size={14} /> My Account
              </Link>
              <Link
                to="/cart"
                className="font-body text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
              >
                <ShoppingCart size={14} /> My Cart
              </Link>
            </div>
            <div className="border-brand-border border-t py-1.5">
              <button
                onClick={onLogout}
                className="font-body text-destructive hover:bg-destructive/5 flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
