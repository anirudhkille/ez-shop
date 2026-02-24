import { useLocation, useNavigate, useSearchParams } from "react-router";

import { Button } from "../ui/button";

type DeliveryProps = {
  goToNextStep: () => void;
};

export default function Delivery({ goToNextStep }: DeliveryProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [q] = useSearchParams();
  const deliveryMethod = q.get("delivery-method");

  return (
    <div className="px-4">
      <h1 className="mb-6 text-xl font-medium">Choose Delivery Method</h1>

      <div className="space-y-4">
        {[
          {
            id: "standard",
            name: "Standard Delivery",
            time: "3–5 days",
            price: "Free",
          },
          {
            id: "express",
            name: "Express Delivery",
            time: "1–2 days",
            price: "₹120",
          },
          {
            id: "same-day",
            name: "Same Day Delivery",
            time: "Today",
            price: "₹199",
          },
        ].map((opt, index) => (
          <div
            key={index}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition hover:border-black ${
              opt.id === deliveryMethod && "border-black"
            }`}
            onClick={() => {
              const params = new URLSearchParams(location.search);
              params.set("delivery-method", opt.id);
              navigate("?" + params.toString());
            }}
          >
            <div>
              <p className="font-semibold">{opt.name}</p>
              <p className="text-sm text-gray-600">{opt.time}</p>
            </div>

            <p className="font-semibold">{opt.price}</p>
          </div>
        ))}
      </div>

      <Button
        onClick={goToNextStep}
        className="bg-foreground text-background hover:bg-foreground/90 mt-5 w-full rounded-full py-6 text-base disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue to Payment
      </Button>
    </div>
  );
}
