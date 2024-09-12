import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Label,
  Card,
  Button,
  Heading,
  Text,
  Input,
  Head,
} from "../../components";
import { toast } from "sonner";
import { useSignupMutation } from "../../redux/api/userAPI";
import { login } from "../../redux/reducer/userReducer";

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [signup, { isLoading }] = useSignupMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleValidation = async (e) => {
    e.preventDefault();

    // const passwordRegex =
    //   /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!formData.name) {
      toast.error("Name can't be empty");
      return;
    } else if (!formData.email) {
      toast.error("Email can't be empty");
      return;
    } else if (!formData.password) {
      toast.error("Password can't be empty");
      return;
    } else if (formData.password.length < 8) {
      toast.error("Password must contain a minimum of 8 characters");
      return;
    }
    //  else if (!formData.password.match(passwordRegex)) {
    //   toast.error(
    //     "Password must contain at least 1 uppercase, 1 digit, and 1 special character"
    //   );
    //   return;}
    else {
      try {
        const res = await signup(formData).unwrap();
        dispatch(login({ userDetails: res.data }));
        toast.success("Account created successfully");
        navigate("/");
      } catch (error) {
        let errorMessage = "Something went wrong";
        if (error.status) {
          switch (error.status) {
            case 409:
              errorMessage = "Email already been used";
              break;
            case 500:
              errorMessage = "Internal server error";
              break;
            default:
              errorMessage = "Something went wrong";
          }
        }
        toast.error(errorMessage);
      }
    }
  };

  return (
    <>
      <Head
        title="Create an Account | EZ Shop"
        description="Join EZ Shop today! Create your account by entering your email, password, and other details. Start enjoying personalized features and more."
      />
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
              <Input id="name" value={formData.name} onChange={handleChange} />
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
          <Button className="w-full" type="submit" disabled={isLoading}>
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
    </>
  );
};

export default SignUp;
