import { postLogin } from "@/api/auth";
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
import { Login as LoginInterface } from "@/types/api";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const { mutate: login, isPending } = useMutation({
    mutationFn: (formData: LoginInterface) => postLogin(formData),
    onSuccess: () => {
      toast.success("Login successful!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred while logging in.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Email can't be empty");
      return;
    }
    if (!formData.password) {
      toast.error("Password can't be empty");
      return;
    }
    login(formData);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center h-screen px-3">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-full mb-5">
            <Logo />
          </div>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email and password to login
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid items-center w-full gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between w-full">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button className="w-full" type="submit" disabled={isPending}>
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
