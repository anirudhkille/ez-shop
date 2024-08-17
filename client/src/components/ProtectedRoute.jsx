import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { cartItems } = useSelector((state) => state.cart.items);
  const navigate = useNavigate();
  useEffect(() => {
    if (cartItems.length === 0) return navigate("/");
  }, [cartItems]);
  return <>{children}</>;
};

export default ProtectedRoute;
