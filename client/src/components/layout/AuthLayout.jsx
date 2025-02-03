import React from "react";
import Card from "../ui/Card";
import Heading from "../ui/Heading";
import Text from "../ui/Text";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import Logo from "../shared/Logo";

export default function AuthLayout({
  heading,
  description,
  children,
  redirect,
  redirectText,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center px-3 min-h-dvh">
      <Card className="p-5 sm:p-8 w-[420px] space-y-6">
        <div className="flex items-center justify-center w-full mb-5">
          <Logo />
        </div>
        <div className="space-y-2 text-center ">
          <Heading as="h2" className="text-2xl">
            {heading}
          </Heading>
          <Text>{description}</Text>
        </div>

        {children}

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
