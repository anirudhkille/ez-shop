import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import LogoutDialog from "./LogoutDialog";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/user/userSlice";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.cartItems || []);
  const userId = useSelector((state) => state.user.userId);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openLogoutDialog = () => {
    setShowLogoutDialog(true);
  };

  const closeLogoutDialog = () => {
    setShowLogoutDialog(false);
  };

  const handleLogout = () => {
    setShowLogoutDialog(false);
    dispatch(logout());
  };

  return (
    <header className="fixed w-full text-gray-600 bg-white shadow-lg body-font">
      <nav className="flex items-center justify-between px-4 py-2 font-bold gap-11">
        <Link
          to="/"
          className="flex items-center font-medium text-gray-900 title-font"
        >
          <img src="/logo.png" alt="logo" height={35} width={35} />
          <span className="ml-3 text-xl font-bold">EZ Shop</span>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Navigation Links for Larger Screens */}
          <div className="items-center hidden space-x-4 md:flex">
            <Link
              to="products/category/men's clothing"
              className="hover:text-indigo-500"
            >
              Mens
            </Link>
            <Link
              to="products/category/women's clothing"
              className="hover:text-indigo-500"
            >
              Womens
            </Link>
            <Link
              to="products/category/electronics"
              className="hover:text-indigo-500"
            >
              Electronics
            </Link>
            <Link
              to="products/category/jewelery"
              className="hover:text-indigo-500"
            >
              Accessories
            </Link>
            <div className="hover:text-indigo-500">
              {userId ? (
                <IconButton onClick={openLogoutDialog}>
                  <LogoutIcon />
                </IconButton>
              ) : (
                <Link to="/login" className="hover:text-indigo-500">
                  Login
                </Link>
              )}
            </div>
          </div>

          <NavLink to="/cart">
            <Badge badgeContent={cartItems.length} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </NavLink>

          {/* Hamburger Menu for Smaller Screens */}
          <div className="md:hidden">
            <IconButton onClick={toggleMenu}>
              <MenuIcon />
            </IconButton>
            {isMenuOpen && (
              <div className="absolute right-0 p-8 text-center bg-white shadow-md top-14">
                <Link
                  to="products/category/men's clothing"
                  className="block py-2 hover:text-indigo-500"
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                  }}
                >
                  Mens
                </Link>
                <Link
                  to="products/category/women's clothing"
                  className="block py-2 hover:text-indigo-500"
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                  }}
                >
                  Womens
                </Link>
                <Link
                  to="products/category/electronics"
                  className="block py-2 hover:text-indigo-500"
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                  }}
                >
                  Electronics
                </Link>
                <Link
                  to="products/category/jewelery"
                  className="block py-2 hover:text-indigo-500"
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                  }}
                >
                  Accessories
                </Link>
                {userId ? (
                  <IconButton
                    onClick={openLogoutDialog}
                    className="block py-2 hover:text-indigo-500"
                  >
                    <LogoutIcon />
                  </IconButton>
                ) : (
                  <Link
                    to="/login"
                    className="block py-2 hover:text-indigo-500"
                    onClick={() => {
                      setIsMenuOpen(!isMenuOpen);
                    }}
                  >
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={closeLogoutDialog}
        onLogout={handleLogout}
      />
    </header>
  );
};

export default Header;
