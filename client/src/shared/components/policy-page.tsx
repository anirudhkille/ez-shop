import type { ReactNode } from "react";

import { Container } from "@/shared/components/container";
import { Head } from "@/shared/components/head";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function PolicyPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Head title={`${title} | EZ Shop`} />
      <Container className="max-w-4xl px-5 py-16 sm:px-8 md:py-10">
        <div className="my-10 text-center">
          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="font-body text-muted-foreground mt-4 text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="font-body text-muted-foreground space-y-8 leading-relaxed">
          {children}
        </div>
      </Container>
    </>
  );
}

export function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="bg-card border-brand-border">
      <CardHeader>
        <CardTitle className="font-display text-foreground text-xl tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
