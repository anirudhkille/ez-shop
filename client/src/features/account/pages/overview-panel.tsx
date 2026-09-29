import { Link } from "react-router";

import { OrderList, useMyOrdersList } from "@/features/order";
import PanelHeader from "@/shared/components/panel-header";

import { PanelCard } from "../components/panel";
import { ProfileCard } from "../components/profile-form";
import { useProfileGreeting } from "../hooks/use-profile-form";

export default function OverviewPanel() {
  const { firstName } = useProfileGreeting();
  const { orders, isLoading: ordersLoading } = useMyOrdersList();

  return (
    <>
      <PanelHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's what's happening with your account."
      />

      <div className="space-y-5">
        <ProfileCard />

        <PanelCard
          title="Recent orders"
          action={
            <Link
              to="/account/orders"
              className="font-body text-brand-orange hover:text-brand-orange/80 text-xs font-semibold"
            >
              View all →
            </Link>
          }
        >
          <OrderList
            orders={orders.slice(0, 2)}
            isLoading={ordersLoading}
            compact
          />
        </PanelCard>
      </div>
    </>
  );
}
