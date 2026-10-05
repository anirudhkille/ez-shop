import { Link } from "react-router";

import { Search } from "lucide-react";

import { navLinks } from "../lib/nav-links";

interface MobileNavProps {
  isOpen: boolean;
  name: string | null;
  cartCount: number;
  onOpenSearch: () => void;
  onClose: () => void;
  onLogout: () => void;
}

const rowClass =
  "font-body text-muted-foreground hover:text-foreground border-brand-border/50 flex items-center gap-3 border-b py-2.5 text-sm font-medium transition-colors";

export function MobileNav({
  isOpen,
  name,
  cartCount,
  onOpenSearch,
  onClose,
  onLogout,
}: MobileNavProps) {
  return (
    <div
      className={`overflow-hidden transition-[max-height,opacity] duration-300 md:hidden ${
        isOpen ? "max-h-120 opacity-100" : "max-h-0 opacity-0"
      } bg-card border-brand-border border-b`}
    >
      <nav className="flex flex-col gap-1 px-6 py-4">
        <button
          onClick={() => {
            onOpenSearch();
            onClose();
          }}
          className={rowClass}
        >
          <Search size={14} /> Search products
        </button>

        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.href}
            onClick={onClose}
            className={`${rowClass} last:border-0`}
          >
            {link.label}
          </Link>
        ))}

        <Link to="/cart" onClick={onClose} className={rowClass}>
          Cart {cartCount}
        </Link>

        {name ? (
          <>
            <Link to="/account" onClick={onClose} className={rowClass}>
              My Account ({name})
            </Link>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="font-body text-destructive hover:text-destructive/80 py-2.5 text-left text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={onClose} className={rowClass}>
              Login
            </Link>
            <Link
              to="/signup"
              onClick={onClose}
              className="font-body text-brand-orange hover:text-brand-orange/80 py-2.5 text-sm font-medium transition-colors"
            >
              Create account
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
