import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as userLogin } from "../../features/user/userSlice";
import { Card, Heading, Button, Input, Label, Text } from "../../components";
import { useLoginMutation } from "../../features/user/userApi";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [login, { isLoading, error }] = useLoginMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleValidation = async (e) => {
    e.preventDefault();

    try {
      const res = await login(formData).unwrap();
      console.log("Login Response:", res); // Debugging log
      dispatch(userLogin({ userId: res._id }));
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      console.error("Login Error:", err); // Debugging log
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center px-3 min-h-dvh">
      <Card
        className="p-5 space-y-6 sm:p-8 w-[420px]"
        as="form"
        onSubmit={handleValidation}
      >
        <div className="space-y-2">
          <Heading as="h2" className="text-3xl">
            Login to your account
          </Heading>
          <Text>Enter your email and password to login</Text>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label id="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label id="password">Password</Label>
              <Button
                variant="link"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>
        <Button className="w-full" type="submit" disabled={isLoading}>
          Login
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            className="mx-auto"
            onClick={() => navigate("/signup")}
          >
            Don't have an account? Sign Up
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
