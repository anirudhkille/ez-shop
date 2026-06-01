

import Container from "@/layout/container";
import Head from "@/layout/head";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShippingInfo() {
  return (
    <>
      <Head title="Shipping Info | EZ Shop" />
      <Container className="max-w-4xl px-5 py-16 sm:px-8 md:px-10">
        <div className="my-10 text-center">
          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Shipping Information
          </h1>
          <p className="font-body text-muted-foreground mt-4 text-lg">
            Everything you need to know about our shipping policies.
          </p>
        </div>

        <div className="font-body text-muted-foreground space-y-8 leading-relaxed">
          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                Delivery Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We strive to process and ship your orders as swiftly as
                possible. Typical delivery times are:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong className="text-foreground">
                    Standard Delivery:
                  </strong>{" "}
                  3-5 business days. Free on orders above ₹1,500.
                </li>
                <li>
                  <strong className="text-foreground">Express Delivery:</strong>{" "}
                  1-2 business days. Available for selected locations at an
                  additional cost.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                Order Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Orders placed before 2:00 PM will be processed the same day.
                Orders placed after 2:00 PM or on weekends/holidays will be
                processed the following business day. Once your order has been
                dispatched, you will receive an email with your tracking number.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                International Shipping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Currently, we only ship within designated domestic zones. We are
                working actively to expand our shipping networks globally. Stay
                tuned!
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
