import React, { ReactNode } from "react";

import Logo from "../shared/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface AuthProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  description,
  children,
}: AuthProps) {
  return (
    <div className="flex h-screen items-center justify-center px-3">
      <Card className="w-full max-w-sm py-5">
        <CardHeader className="text-center">
          <div className="mb-5 flex w-full items-center justify-center">
            <Logo />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
