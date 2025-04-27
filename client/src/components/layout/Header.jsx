import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import LogoutDialog from "../LogoutDialog";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/reducer/userReducer";
import useCartStore from "../../store/cartStore";
import { X, ShoppingBag, Menu, LogOut } from "lucide-react";
import MaxContainer from "./MaxContainer";

const Header = () => {
  const { cartItems } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.user.userId);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const openLogoutDialog = () => setShowLogoutDialog(true);

  const closeLogoutDialog = () => setShowLogoutDialog(false);

  const handleLogout = () => {
    setShowLogoutDialog(false);
    dispatch(logout());
  };

  const menus = [
    { href: "men's clothing", name: "Mens" },
    { href: "women's clothing", name: "Womens" },
    { href: "electronics", name: "Electronics" },
    { href: "jewelery", name: "Accessories" },
  ];

  return (
    <header className="sticky top-0 w-full text-gray-600 bg-white">
      <div className="bg-[#F5F5F5] w-full">
        <MaxContainer className="justify-end hidden gap-5 px-5 py-1.5 text-sm font-semibold text-primary md:flex">
          <NavLink to="/signup">Signup</NavLink> |
          <NavLink to="/login">Login</NavLink>
        </MaxContainer>
      </div>

      <MaxContainer className="flex items-center justify-between px-5 py-3 font-bold gap-11">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="logo" height={35} width={35} />
          <span className="text-xl font-bold text-primary">EZ Shop</span>
        </Link>

        <nav className="items-center hidden space-x-4 md:flex">
          {menus.map((m) => (
            <Link
              to={`/products/category/${m.href}`}
              className="text-primary hover:underline underline-offset-4"
            >
              {m.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {/* Navigation Links for Larger Screens */}

          <NavLink to="/cart" className="relative">
            <ShoppingBag className="text-primary size-6" strokeWidth={1.5} />
            <div
              className="absolute text-sm text-center rounded-full -right-3 -top-3 px-1.5
             text-secondary bg-primary"
            >
              {cartItems.length}
            </div>
          </NavLink>

          <button className="md:hidden" onClick={toggleMenu}>
            <Menu />
          </button>
        </div>
      </MaxContainer>

      <div className="top-0 right-0 w-full h-full md:hidden bg-black/50">
        <div
          className={`fixed p-8 bg-white shadow-md top-0 righ-0 z-50 w-full h-full max-w-sm duration-700 transform ${
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
                to={`/products/category/${m.href}`}
                className="block text-2xl font-semibold text-primary"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {m.name}
              </Link>
            ))}
          </nav>

          <div className="mt-10">
            {userId ? (
              <Button
                onClick={openLogoutDialog}
                className="block py-2 hover:text-primary"
              >
                <LogOut />
              </Button>
            ) : (
              <div className="flex gap-5">
                <Link
                  to="/login"
                  className="block w-full py-2 text-center text-white bg-black rounded-full"
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                  }}
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="block w-full py-2 font-semibold text-center border border-gray-400 rounded-full text-primary"
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

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={closeLogoutDialog}
        onLogout={handleLogout}
      />
    </header>
  );
};

export default Header;
