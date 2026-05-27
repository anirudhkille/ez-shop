import { Cookie } from "lucide-react";

import Container from "@/layout/container";
import Head from "@/layout/head";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiePolicy() {
  return (
    <>
      <Head title="Cookie Policy | EZ Shop" />
      <Container className="max-w-4xl px-5 py-16 sm:px-8 md:px-10">
        <div className="mb-10 text-center">
          <div className="bg-brand-orange/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Cookie className="text-brand-orange h-10 w-10" />
          </div>
          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="font-body text-muted-foreground mt-4 text-lg">
            Last updated: October 10, 2026
          </p>
        </div>

        <div className="font-body text-muted-foreground space-y-8 leading-relaxed">
          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                1. What Are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Cookies are small text files that are stored on your computer or
                mobile device when you visit a website. They are widely used to
                make websites work more efficiently and provide information to
                the owners of the site.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                2. How We Use Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We use cookies and similar tracking technologies to track the
                activity on our Service and hold certain information. We use
                cookies for the following purposes:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong className="text-foreground">Essential Cookies:</strong>{" "}
                  Necessary for the website to function properly, such as
                  authenticating users and preventing fraudulent use of user
                  accounts.
                </li>
                <li>
                  <strong className="text-foreground">Analytics Cookies:</strong>{" "}
                  Allow us to understand how visitors interact with the website
                  by collecting and reporting information anonymously.
                </li>
                <li>
                  <strong className="text-foreground">Preference Cookies:</strong>{" "}
                  Enable a website to remember information that changes the way
                  the website behaves or looks, like your preferred language.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-border">
            <CardHeader>
              <CardTitle className="font-display text-foreground text-xl tracking-wide">
                3. Managing Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                You can instruct your browser to refuse all cookies or to
                indicate when a cookie is being sent. However, if you do not
                accept cookies, you may not be able to use some portions of our
                Service. Check your browser specific settings to clear or delete
                cookies.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
