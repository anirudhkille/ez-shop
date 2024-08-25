import { useState } from "react";
import Toast from "../../components/Toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useDispatch } from "react-redux";
import { login } from "../../features/user/userSlice";
import { Card, Heading, Button, Input, Label, Text } from "../../components";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleValidation = (e) => {
    e.preventDefault();

    setLoading(true); // Start loading before making the request

    axios
      .post("https://ez-shop-server.onrender.com/api/login", formData)
      .then((res) => {
        dispatch(login({ userId: res.data._id })); // Correct dispatch format
        navigate("/");
      })
      .catch((error) => {
        // setErrorMessage("Invalid email or password");
        // callingToast();
        console.error("Login failed:", error);
      })
      .finally(() => {
        setLoading(false); // Stop loading after request completes
      });
  };

  const callingToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
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
        <Button className="w-full" type="submit" loading={loading}>
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
