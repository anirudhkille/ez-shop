import { useLocation, useNavigate, useSearchParams } from "react-router";

import type { TDeliveryMethod } from "@/types/order";

import { usePlaceCodOrder } from "@/hooks/useOrder";
import { usePayment } from "@/hooks/usePayment";

import { Button } from "../../components/ui/button";

const options = [
  { id: "card", label: "Credit / Debit Card" },
  { id: "cod", label: "Cash on Delivery" },
];

export default function Payment() {
  const { mutate: cardOrder } = usePayment();
  const { mutate: codOrder } = usePlaceCodOrder();
  const navigate = useNavigate();
  const location = useLocation();
  const [q] = useSearchParams();
  const addressId = q.get("address");
  const paymentMethod = q.get("payment-method");
  const deliveryMethod = q.get("delivery-method") as TDeliveryMethod;

  const handlePlaceOrder = () => {
    if (paymentMethod === "cod")
      codOrder({
        addressId: addressId ?? "",
        deliveryMethod: deliveryMethod ?? "standard",
      });
    else
      cardOrder({
        addressId: addressId ?? "",
        deliveryMethod: deliveryMethod ?? "standard",
      });
  };

  return (
    <div className="px-4">
      <h1 className="mb-6 text-xl font-bold">Payment</h1>

      <div className="space-y-4">
        {options.map((o) => (
          <button
            key={o.id}
            className={`flex w-full justify-between rounded-xl border p-4 hover:border-black ${
              o.id === paymentMethod && "border-black"
            }`}
            onClick={() => {
              const params = new URLSearchParams(location.search);
              params.set("payment-method", o.id);
              navigate("?" + params.toString());
            }}
          >
            <span>{o.label}</span>
            <span>➜</span>
          </button>
        ))}
      </div>

      <Button
        onClick={handlePlaceOrder}
        className="bg-foreground text-background hover:bg-foreground/90 mt-5 w-full rounded-full py-6 text-base disabled:cursor-not-allowed disabled:opacity-50"
      >
        Place an Order
      </Button>
    </div>
  );
}
