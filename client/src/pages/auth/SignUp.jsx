import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { Label, Card, Button, Heading, Text, Input } from "../../components";

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [signupClicked, setSignupClicked] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const callingToast = (msg) => {
    toast.error(msg);
  };

  const handleValidation = (e) => {
    e.preventDefault();
    setSignupClicked(true);

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (password.length < 8) {
      callingToast("Password must contain a minimum of 8 characters");
    } else if (!password.match(passwordRegex)) {
      callingToast(
        "Password must contain at least 1 uppercase, 1 digit, and 1 special character"
      );
    } else {
      axios
        .post("https://ez-shop-server.onrender.com/api/signUp", formData)
        .then((res) => {
          navigate("/");
          dispatch(login({ id: res.data._id }));
          setLoading(true);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
          callingToast("An error occurred. Please try again.");
        });
    }
  };

  return (
    <div className="flex items-center justify-center h-[100vh] px-3 overflow-hidden">
      <Card
        className="p-5 space-y-4 sm:p-8 w-[420px]"
        as="form"
        onSubmit={handleValidation}
      >
        <div className="space-y-2">
          <Heading as="h2" className="text-3xl">
            Create an account
          </Heading>
          <Text>Enter your details to create a new account</Text>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label id="name">Name</Label>
            <Input id="name" value={formData.email} onChange={handleChange} />
          </div>

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
          Create an Account
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            className="mx-auto"
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;
