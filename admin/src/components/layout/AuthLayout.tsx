import React, { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import Logo from "../shared/Logo";
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
    <div className="flex items-center justify-center h-screen px-3">
      <Card className="w-full max-w-sm py-5">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-full mb-5">
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
