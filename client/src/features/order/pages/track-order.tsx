import { Container } from "@/shared/components/container";
import { Head } from "@/shared/components/head";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatPrice } from "@/shared/lib/format-price";

import { TrackOrderForm } from "../components/track-order-form";
import { useTrackOrder } from "../hooks/use-track-order";

export default function TrackOrder() {
  const { order, isLoading, isError, search } = useTrackOrder();

  return (
    <>
      <Head title="Track Order | EZ Shop" />
      <Container className="max-w-4xl px-5 py-16 sm:px-8 md:px-10">
        <div className="my-10 text-center">
          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Track Your Order
          </h1>
          <p className="font-body text-muted-foreground mt-4 text-lg">
            Enter your Order ID to check the current status of your shipment.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                Tracking Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrackOrderForm isLoading={isLoading} onSearch={search} />
            </CardContent>
          </Card>

          {isError && (
            <Card className="bg-card border-brand-border mt-6">
              <CardContent className="p-6 text-center">
                <p className="font-body text-muted-foreground">
                  Order not found. Please check the Order ID and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {order && (
            <Card className="bg-card border-brand-border mt-6">
              <CardHeader>
                <CardTitle className="font-display text-foreground text-xl tracking-wide">
                  Order #{order._id?.slice(-6).toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-muted-foreground text-sm">
                      Status
                    </span>
                    <span className="font-body text-foreground text-sm font-semibold capitalize">
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-muted-foreground text-sm">
                      Payment
                    </span>
                    <span className="font-body text-foreground text-sm font-semibold capitalize">
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-muted-foreground text-sm">
                      Total
                    </span>
                    <span className="font-display text-brand-orange text-lg font-bold">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-muted-foreground text-sm">
                      Items
                    </span>
                    <span className="font-body text-foreground text-sm">
                      {order.products?.length ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-muted-foreground text-sm">
                      Delivery
                    </span>
                    <span className="font-body text-foreground text-sm capitalize">
                      {order.deliveryMethod}
                    </span>
                  </div>
                  {order.address && (
                    <div className="border-brand-border mt-4 border-t pt-4">
                      <p className="font-body text-muted-foreground mb-2 text-xs tracking-wider uppercase">
                        Shipping Address
                      </p>
                      <p className="font-body text-foreground text-sm">
                        {order.address.addressLine1}
                        {order.address.addressLine2
                          ? `, ${order.address.addressLine2}`
                          : ""}
                        <br />
                        {order.address.city}, {order.address.state}{" "}
                        {order.address.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </>
  );
}
