import { useEffect, useState } from "react";

import { Link, useLocation, useNavigate } from "react-router";

import { LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react";

import useUserStore from "@/store/userStore";

import SearchModal from "@/features/product/search-modal";

const navLinks = [
  { label: "Men", href: "/category/men" },
  { label: "Women", href: "/category/women" },
  { label: "Kids", href: "/category/kids" },
  { label: "Shoes", href: "/products" },
  { label: "Clothing", href: "/products" },
  { label: "Accessories", href: "/products" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close profile menu on route change
  useEffect(() => {
    setProfileMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const solidBg = !isHomePage || scrolled;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatarInitial = user
    ? (user.displayName?.[0] ?? user.email[0]).toUpperCase()
    : "";

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        solidBg
          ? "bg-background/95 border-brand-border border-b shadow-lg backdrop-blur-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-350 items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <div className="bg-gradient-orange flex h-8 w-auto items-center justify-center rounded-sm px-2">
            <span className="text-primary-foreground font-display text-sm leading-none font-black tracking-tight">
              EZ
            </span>
          </div>
          <span className="font-display text-foreground text-2xl font-bold tracking-wider">
            EZ Shop
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="font-body text-muted-foreground hover:text-foreground group relative text-sm font-medium transition-colors duration-200"
            >
              {link.label}
              <span className="bg-brand-orange absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted hidden h-9 w-9 items-center justify-center rounded-full transition-all duration-200 md:flex"
            aria-label="Open search"
          >
            <Search size={18} />
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="text-muted-foreground hover:text-foreground hover:bg-muted relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
          >
            <ShoppingCart size={18} />
            <span className="bg-brand-orange text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold">
              3
            </span>
          </Link>

          {/* Profile / auth */}
          <div className="relative hidden md:block">
            {user ? (
              <>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="bg-brand-orange/10 border-brand-orange/30 font-display text-brand-orange hover:bg-brand-orange/20 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black transition-all duration-200"
                >
                  {avatarInitial}
                </button>

                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="bg-card border-brand-border absolute top-12 right-0 z-50 w-52 overflow-hidden rounded-2xl border shadow-[0_20px_60px_-10px_hsl(0_0%_0%/0.8)]">
                      <div className="border-brand-border border-b px-4 py-3">
                        <p className="font-body text-foreground truncate text-sm font-semibold">
                          {user.displayName}
                        </p>
                        <p className="font-body text-muted-foreground truncate text-xs">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-1.5">
                        <Link
                          to="/profile"
                          className="font-body text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        >
                          <User size={14} /> My Profile
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
                          onClick={handleLogout}
                          className="font-body text-destructive hover:bg-destructive/5 flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        >
                          <LogOut size={14} /> Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Link
                to="/auth/login"
                className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
              >
                <User size={18} />
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full transition-all md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          mobileOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        } bg-card border-brand-border border-b`}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          <button
            onClick={() => {
              setSearchOpen(true);
              setMobileOpen(false);
            }}
            className="font-body text-muted-foreground hover:text-foreground border-brand-border/50 flex items-center gap-3 border-b py-2.5 text-sm font-medium transition-colors"
          >
            <Search size={14} /> Search products
          </button>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="font-body text-muted-foreground hover:text-foreground border-brand-border/50 border-b py-2.5 text-sm font-medium transition-colors last:border-0"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/cart"
            className="font-body text-muted-foreground hover:text-foreground border-brand-border/50 border-b py-2.5 text-sm font-medium transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Cart (3)
          </Link>
          {user ? (
            <>
              <Link
                to="/profile"
                className="font-body text-muted-foreground hover:text-foreground border-brand-border/50 border-b py-2.5 text-sm font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                My Profile ({user.displayName})
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="font-body text-destructive hover:text-destructive/80 py-2.5 text-left text-sm font-medium transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="font-body text-muted-foreground hover:text-foreground border-brand-border/50 border-b py-2.5 text-sm font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/auth/signup"
                className="font-body text-brand-orange hover:text-brand-orange/80 py-2.5 text-sm font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
