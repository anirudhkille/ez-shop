import { OrderSuccess } from "../components/order-success";
import { usePaymentResult } from "../hooks/use-payment-result";

export default function SuccessPage() {
  const { order, found, isLoading, email, allowShowFull } = usePaymentResult();

  if (isLoading) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  if (found) {
    return (
      <OrderSuccess
        order={order!}
        email={email}
        allowShowFull={allowShowFull}
      />
    );
  }

  return (
    <div className="py-20 text-center">
      <h2 className="text-xl font-semibold">Invalid request</h2>
      <p className="mt-2 text-gray-600">
        No order information found. Please return to the home page.
      </p>
    </div>
  );
}
