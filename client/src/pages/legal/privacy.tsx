import Container from "@/layout/container";
import Head from "@/layout/head";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <>
      <Head title="Privacy Policy | EZ Shop" />
      <Container className="max-w-4xl px-5 py-16 sm:px-8 md:px-10">
        <div className="my-10 text-center">
          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="font-body text-muted-foreground mt-4 text-lg">
            Last updated: October 10, 2026
          </p>
        </div>

        <div className="font-body text-muted-foreground space-y-8 leading-relaxed">
          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We collect information you provide directly to us, such as when
                you create or modify your account, request on-demand services,
                contact customer support, or otherwise communicate with us.
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  Name, email address, physical address, and phone number.
                </li>
                <li>Payment information and transaction history.</li>
                <li>Demographic data and preferences.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We use the information we collect to provide, maintain, and
                improve our services. This includes using the information to
                process transactions, send related information, including
                confirmations and invoices, and provide customer service. We
                also use the information to personalize and improve the services
                and provide content or features that match user profiles or
                interests.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                3. Sharing of Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We may share the information we collect about you as described
                in this Policy or as described at the time of collection or
                sharing, including selectively with external business partners
                and service providers that perform services for us. These
                services include payment processing, shipping providers, and
                data analytics platforms.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                4. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We implement industry-standard security measures designed to
                safeguard your information. However, no data transmission over
                the internet or storage system can be guaranteed to be 100%
                secure.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
