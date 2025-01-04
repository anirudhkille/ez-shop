import { postForgotPassword } from "@/api/auth";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { mutate, isPending } = useMutation({
    mutationFn: (email: string) => postForgotPassword(email),
    onSuccess: () => {
      toast.success("Password reset link sent");
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred while sending link.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email can't be empty");
      return;
    }
    mutate(email);
  };

  return (
    <div className="flex items-center justify-center h-screen px-3">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-full mb-5">
            <Logo />
          </div>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>
            Enter your email address below and we'll send you a link to reset
            your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button className="w-full" type="submit" disabled={isPending}>
              Reset password
            </Button>
            <Button variant="link" onClick={() => navigate("/")}>
              Remember your password? Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
