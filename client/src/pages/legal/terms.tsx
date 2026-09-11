import Container from "@/layout/container";
import Head from "@/layout/head";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfUse() {
  return (
    <>
      <Head title="Terms of Use | EZ Shop" />
      <Container className="max-w-4xl px-5 py-16 sm:px-8 md:px-10">
        <div className="my-10 text-center">
          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Terms of Use
          </h1>
          <p className="font-body text-muted-foreground mt-4 text-lg">
            Last updated: October 10, 2026
          </p>
        </div>

        <div className="font-body text-muted-foreground space-y-8 leading-relaxed">
          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                By accessing and using EZ Shop, you accept and agree to be bound
                by the terms and provision of this agreement. In addition, when
                using these particular services, you shall be subject to any
                posted guidelines or rules applicable to such services.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                2. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                The site and its original content, features, and functionality
                are owned by EZ Shop and are protected by international
                copyright, trademark, patent, trade secret, and other
                intellectual property or proprietary rights laws. No material
                from the site may be copied, reproduced, republished, uploaded,
                posted, transmitted, or distributed in any way without explicit
                permission.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                3. User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you create an account on the EZ Shop platform, you are
                responsible for maintaining the security of your account, and
                you are fully responsible for all activities that occur under
                the account and any other actions taken in connection with it.
                You must immediately notify us of any unauthorized uses of your
                account or any other breaches of security.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                4. Products and Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We reserve the right to refuse service to anyone for any reason
                at any time. Prices for our products are subject to change
                without notice. We reserve the right at any time to modify or
                discontinue the Service (or any part or content thereof) without
                notice at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
