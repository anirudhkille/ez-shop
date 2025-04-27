import React, { useEffect } from "react";
import useCartStore from "../store/cartStore";
import { CircleCheck } from "lucide-react";

const OrderSummary = () => {
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="mt-20 space-y-5 text-center">
      <CircleCheck className="mx-auto size-10" />
      <p className="px-2 text-xl font-bold tracking-wider text-primary">
        Order Placed Successfully!
      </p>
      <div className="px-2 text-lg tracking-wider text-primary">
        <p>Thank you for ordering with EZ Shop.</p>
        <p>Your Package will be deliver within 3 days.</p>
      </div>
    </div>
  );
};

export default OrderSummary;
