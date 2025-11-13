import Logo from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { type ReactNode } from "react";
import { useNavigate } from "react-router";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  redirect: string;
  redirectText: string;
};

export default function AuthLayout({
  title,
  description,
  children,
  redirect,
  redirectText,
}: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen items-center justify-center px-3">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-5 flex w-full items-center justify-center">
            <Logo />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <div className="text-center">
          <Button
            variant="link"
            className="mx-auto"
            onClick={() => navigate(redirect)}
          >
            {redirectText}
          </Button>
        </div>
      </Card>
    </div>
  );
}
