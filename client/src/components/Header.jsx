import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useCartContext } from "../context/cartContext";
import { useUserContext } from "../context/userContext";
import LogoutIcon from "@mui/icons-material/Logout";

const Header = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const { cartItems, addToCart, removeFromCart, clearCart, getCartTotal } =
    useCartContext();
  const { login, setLogin } = useUserContext();

  return (
    <header className="text-gray-600 body-font shadow-lg fixed w-full bg-white">
      <nav className="flex items-center gap-11 justify-between px-4 py-2 font-bold  ">
        <Link
          to="/"
          className="flex title-font font-medium items-center text-gray-900"
        >
          <img src="/logo.png" alt="logo" height={35} width={35} />
          <span className="ml-3 text-xl font-bold">EZ Shop</span>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Navigation Links for Larger Screens */}
          <div className="hidden md:flex space-x-4 items-center">
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
            <Link to="/login" className="hover:text-indigo-500">
              {login ? (
                <IconButton onClick={()=>setLogin(false)}>
                  <LogoutIcon />
                </IconButton>
              ) : (
                "Login"
              )}
            </Link>
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
              <div className="absolute top-16 right-0 bg-white p-8 shadow-md text-center">
                <Link
                  to="products/category/men's clothing"
                  className="block py-2 hover:text-indigo-500"
                >
                  Mens
                </Link>
                <Link
                  to="products/category/women's clothing"
                  className="block py-2 hover:text-indigo-500"
                >
                  Womens
                </Link>
                <Link
                  to="products/category/electronics"
                  className="block py-2 hover:text-indigo-500"
                >
                  Electronics
                </Link>
                <Link
                  to="products/category/jewelery"
                  className="block py-2 hover:text-indigo-500"
                >
                  Accessories
                </Link>
                {login ? (
                  <IconButton
                    onClick={() => setLogin(false)}
                    className="block py-2 hover:text-indigo-500"
                  >
                    <LogoutIcon />
                  </IconButton>
                ) : (
                  <Link
                    to="/login"
                    className="block py-2 hover:text-indigo-500"
                  >
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
