import { useState } from "react";

import { PackageSearch } from "lucide-react";

import { formatPrice } from "@/lib/formatPrice";

import { useOrderById } from "@/hooks/useOrder";

import Container from "@/layout/container";
import Head from "@/layout/head";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function TrackOrder() {
  const [orderInput, setOrderInput] = useState("");
  const [searchedId, setSearchedId] = useState("");

  const { data: orderData, isLoading, isError } = useOrderById(searchedId);

  const order = orderData?.data;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderInput.trim()) {
      setSearchedId(orderInput.trim());
    }
  };

  return (
    <>
      <Head title="Track Order | EZ Shop" />
      <Container className="max-w-4xl px-5 py-16 sm:px-8 md:px-10">
        <div className="mb-10 text-center">
          <div className="bg-brand-orange/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <PackageSearch className="text-brand-orange h-10 w-10" />
          </div>
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
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="order-id"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    Order ID
                  </label>
                  <Input
                    id="order-id"
                    type="text"
                    value={orderInput}
                    onChange={(e) => setOrderInput(e.target.value)}
                    placeholder="Paste your Order ID here"
                    className="bg-background w-full"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!orderInput.trim() || isLoading}
                  className="bg-brand-orange hover:bg-brand-orange/90 mt-4 w-full text-white"
                >
                  {isLoading ? "Searching..." : "Track Package"}
                </Button>
              </form>
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
