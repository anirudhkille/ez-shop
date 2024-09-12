import React, { useEffect } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/reducer/userReducer";

const OrderSummary = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCart());
  }, []);

  return (
    <div>
      <div className="mt-20 text-center">
        <div className="mb-4 text-2xl font-bold text-indigo-500">
          <div>
            <CheckCircleIcon style={{ height: 70, width: 70 }} />
          </div>
          Order Placed Successfully!
        </div>
        <p className="px-2 text-lg font-bold tracking-wider text-indigo-500">
          Thank you for ordering with EZ Shop.Your Package will be deliver
          within 3 days.
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
