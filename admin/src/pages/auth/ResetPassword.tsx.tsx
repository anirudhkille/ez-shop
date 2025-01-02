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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };
  
  const handleSubmit = () => {};
  return (
    <div className="flex items-center justify-center h-screen px-3">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            Enter a new password for your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid items-center w-full gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter the new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Enter the confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
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
