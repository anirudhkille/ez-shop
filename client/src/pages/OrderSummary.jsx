import React, { useEffect } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useCartContext } from "../context/cartContext";

const OrderSummary = () => {
  const { emptyCart } = useCartContext();

  useEffect(() => {
    emptyCart();
  }, []);

  return (
    <div>
      <div className="text-center mt-20">
        <div className="text-2xl font-bold text-indigo-500 mb-4">
          <div>
            <CheckCircleIcon style={{ height: 70, width: 70 }} />
          </div>
          Order Placed Successfully!
        </div>
        <p className="text-lg text-indigo-500 font-bold px-2 tracking-wider">
          Thank you for ordering with EZ Shop.Your Package will be deliver
          within 3 days.
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
