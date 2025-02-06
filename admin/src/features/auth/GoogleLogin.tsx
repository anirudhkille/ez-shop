"use client";
import React from "react";
import { Button } from "../../components/ui/button";
import { signIn } from "next-auth/react";

export default function GoogleLogin() {
  return (
    <Button
      className="w-full"
      variant="outline"
      onClick={() => signIn("google")}
    >
      Login with Google
    </Button>
  );
}
