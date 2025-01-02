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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = () => {};
  return (
    <div className="flex items-center justify-center h-screen px-3">
      <Card className="w-full max-w-sm">
        <CardHeader>
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
            <Button className="w-full" type="submit">
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
