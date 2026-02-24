import { useState } from "react";

import { Link } from "react-router";

import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";

import useAuthStore from "@/store/userStore";

import { useCart } from "@/hooks/useCart";

import Container from "./container";

const menus = [
  { href: "?new-featured", name: "New & Featured" },
  { href: "?gender=men", name: "Men" },
  { href: "?gender=women", name: "Women" },
  { href: "sale", name: "Sale" },
];

export default function Header() {
  return (
    <>
      <Mobile />
      <DeskTop />
    </>
  );
}

function Mobile() {
  const { name } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  return (
    <header className="sticky top-0 w-full bg-white md:hidden">
      <Container className="flex items-center justify-between gap-11 px-5 py-3 font-bold">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="logo" height={35} width={35} />
          <span className="text-xl font-bold">EZ Shop</span>
        </Link>

        <div className="flex items-center space-x-4">
          <button>
            <Search className="text-primary size-6" strokeWidth={1.5} />
          </button>

          <Link to="/wishlist">
            <Heart className="text-primary size-6" strokeWidth={1.5} />
          </Link>

          <Cart />

          <button onClick={toggleMenu}>
            <Menu />
          </button>
        </div>
      </Container>

      <div className="top-0 right-0 h-full w-full bg-black/50">
        <div
          className={`righ-0 fixed top-0 z-50 h-full w-full max-w-sm transform bg-white p-8 shadow-md duration-700 ${
            isMenuOpen ? "right-0" : "-right-full"
          }`}
        >
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex justify-self-end"
          >
            <X className="size-8" />
          </button>

          <nav className="mt-10 space-y-3">
            {menus.map((m) => (
              <Link
                key={m.name}
                to={`/products/${m.href}`}
                className="block text-2xl font-semibold"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {m.name}
              </Link>
            ))}
          </nav>

          <div className="mt-10">
            {name ? (
              <Link
                to="/account/account-details"
                className="flex items-center gap-2 font-medium"
              >
                <User className="size-5" /> Hi, {name}
              </Link>
            ) : (
              <div className="flex gap-5">
                <Link
                  to="/login"
                  className="block w-full rounded-full bg-black py-2 text-center text-white"
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                  }}
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="block w-full rounded-full border border-gray-400 py-2 text-center font-semibold"
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                  }}
                >
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function DeskTop() {
  const { name } = useAuthStore();
  return (
    <header className="sticky top-0 z-50 hidden w-full bg-white md:block">
      <div className="w-full bg-[#F5F5F5]">
        <Container className="hidden justify-end gap-5 px-5 py-1.5 text-sm font-semibold md:flex">
          {!name ? (
            <>
              <Link to="/signup">Signup</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            <Link
              to="/account/account-details"
              className="flex items-center gap-2"
            >
              <User className="size-5" /> Hi, {name}
            </Link>
          )}
        </Container>
      </div>

      <Container className="flex items-center justify-between gap-10 px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="logo" height={35} width={35} />
          <span className="text-xl font-bold">EZ Shop</span>
        </Link>

        <nav className="hidden items-center space-x-4 md:flex">
          {menus.map((m) => (
            <Link
              to={`/products/${m.href}`}
              key={m.name}
              className="font-semibold underline-offset-4 hover:underline"
            >
              {m.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button>
            <Search className="text-primary size-6" strokeWidth={1.5} />
          </button>

          <Link to="/wishlist">
            <Heart className="text-primary size-6" strokeWidth={1.5} />
          </Link>

          <Cart />
        </div>
      </Container>
    </header>
  );
}

function Cart() {
  const { data } = useCart();

  const cartCount = data?.data?.products?.length;
  return (
    <Link to="/cart" className="relative">
      <ShoppingBag className="text-primary size-6" strokeWidth={1.5} />
      {cartCount >= 1 && (
        <div className="text-secondary bg-primary absolute -top-3 -right-3 rounded-full px-1.5 text-center text-sm">
          {cartCount}
        </div>
      )}
    </Link>
  );
}
