import Container from "@/layout/container";
import Head from "@/layout/head";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Returns() {
  return (
    <>
      <Head title="Returns & Exchanges | EZ Shop" />
      <Container className="max-w-4xl px-5 py-16 sm:px-8 md:px-10">
        <div className="my-10 text-center">
          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Returns & Exchanges
          </h1>
          <p className="font-body text-muted-foreground mt-4 text-lg">
            Hassle-free returns within 30 days of purchase.
          </p>
        </div>

        <div className="font-body text-muted-foreground space-y-8 leading-relaxed">
          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                Return Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you are not completely satisfied with your purchase, you can
                return unworn, unwashed, and unaltered items within 30 days of
                receipt for a full refund back to your original payment method.
                Items must be returned with all original tags attached.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                How to Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-2 pl-6">
                <li>
                  Log in to your account and go to the <strong>Orders</strong>{" "}
                  section.
                </li>
                <li>
                  Select the item(s) you wish to return and follow the provided
                  prompts.
                </li>
                <li>Print the generated return shipping label.</li>
                <li>
                  Pack your item(s) securely and attach the label to the outside
                  of the package.
                </li>
                <li>
                  Drop off your package at the nearest authorized carrier Drop
                  Off Location.
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                Exchanges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Need a different size or color? The fastest way to ensure you
                get what you want is to return the item you have, and once the
                return is accepted, make a separate purchase for the new item.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
