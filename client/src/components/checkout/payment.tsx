import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Button } from "../ui/button";
import { usePayment } from "@/hooks/usePayment";
import { usePlaceCodOrder } from "@/hooks/useOrder";
import type { TDeliveryMethod } from "@/types/order";

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
      <h1 className="text-xl font-bold mb-6">Payment</h1>

      <div className="space-y-4">
        {options.map((o) => (
          <button
            key={o.id}
            className={`w-full border p-4 rounded-xl flex justify-between hover:border-black ${
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
        className="w-full rounded-full py-6 text-base bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed mt-5"
      >
        Place an Order
      </Button>
    </div>
  );
}
