import { lazy, Suspense } from "react";

import { Link, useLocation, useNavigate } from "react-router";

import { Menu, Search, ShoppingCart, X } from "lucide-react";

import { useUserStore } from "@/features/auth";
import { useGetCartCount } from "@/features/cart";

import MobileNav from "./components/mobile-nav";
import ProfileMenu from "./components/profile-menu";
import { useHeaderOverlays } from "./hooks/use-header-overlays";
import { useScrolled } from "./hooks/use-scrolled";
import { navLinks } from "./lib/nav-links";

const SearchModal = lazy(() =>
  import("@/features/product").then((m) => ({ default: m.SearchModal }))
);

export default function Header() {
  const { data: cartCount } = useGetCartCount();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { name, email, logout } = useUserStore();

  const scrolled = useScrolled(40);
  const {
    searchOpen,
    openSearch,
    closeSearch,
    mobileOpen,
    setMobileOpen,
    closeMobile,
    profileMenuOpen,
    toggleProfile,
    closeProfile,
  } = useHeaderOverlays();

  const solidBg = pathname !== "/" || scrolled;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        solidBg
          ? "bg-background/95 border-brand-border border-b shadow-lg backdrop-blur-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-350 items-center justify-between px-6 lg:px-10">
        <Link to="/" className="group flex items-center gap-2">
          <div>
            <img
              src="/logo.svg"
              alt="EZ Shop Logo"
              loading="eager"
              className="size-6 object-contain"
            />
          </div>
          <span className="font-display text-foreground text-2xl font-bold tracking-wider">
            EZ Shop
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="font-body text-muted-foreground hover:text-foreground group relative text-sm font-medium transition-colors duration-200"
            >
              {link.label}
              <span className="bg-brand-orange absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={openSearch}
            className="text-muted-foreground hover:text-foreground hover:bg-muted hidden h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 md:flex"
            aria-label="Open search"
          >
            <Search size={18} />
          </button>

          <Link
            to="/cart"
            aria-label="Shopping Cart"
            className="text-muted-foreground hover:text-foreground hover:bg-muted relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="bg-brand-orange text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative hidden md:block">
            <ProfileMenu
              name={name}
              email={email}
              isOpen={profileMenuOpen}
              onToggle={toggleProfile}
              onClose={closeProfile}
              onLogout={handleLogout}
            />
          </div>

          <button
            className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <MobileNav
        isOpen={mobileOpen}
        name={name}
        cartCount={cartCount}
        onOpenSearch={openSearch}
        onClose={closeMobile}
        onLogout={handleLogout}
      />

      <Suspense fallback={null}>
        <SearchModal open={searchOpen} onClose={closeSearch} />
      </Suspense>
    </header>
  );
}
