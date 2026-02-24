import OrderSuccess from "@/components/payment/order-success";
import { useOrderById, useOrderBySessionId } from "@/hooks/useOrder";
import useUserStore from "@/store/userStore";
import { useSearchParams } from "react-router";

export default function SuccessPage() {
  const [q] = useSearchParams();
  const orderId = q.get("orderId");
  const sessionId = q.get("session_id");

  const { token } = useUserStore();

  // Fetch COD order by orderId
  const { data: orderById, isLoading: loadingId } = useOrderById(orderId ?? "");

  // Fetch Card order by Stripe sessionId
  const { data: orderBySession, isLoading: loadingSession } =
    useOrderBySessionId(sessionId ?? "");

  // Loading state
  if ((orderId && loadingId) || (sessionId && loadingSession)) {
    return <div className="text-center py-10">Loading...</div>;
  }

  // COD path
  if (orderId && orderById) {
    return (
      <OrderSuccess
        order={orderById.data}
        email={orderById?.data?.userEmail}
        allowShowFull={!!token}
      />
    );
  }

  if (sessionId && orderBySession) {
    return (
      <OrderSuccess
        order={orderBySession.data}
        email={orderBySession?.data?.userEmail}
        allowShowFull={!!token}
      />
    );
  }

  return (
    <div className="text-center py-20">
      <h2 className="text-xl font-semibold">Invalid request</h2>
      <p className="text-gray-600 mt-2">
        No order information found. Please return to the home page.
      </p>
    </div>
  );
}
