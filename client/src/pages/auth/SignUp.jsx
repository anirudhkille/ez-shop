import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Label, Button, Input, Head } from "../../components";
import { toast } from "sonner";
import { useSignupMutation } from "../../redux/api/userAPI";
import { login } from "../../redux/reducer/userReducer";
import AuthLayout from "../../components/layout/AuthLayout";

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
    } else {
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
      <AuthLayout
        heading="Create an account"
        description="Enter your details to create a new account"
        redirect="/login"
        redirectText="Already have an account? Login"
      >
        <form onSubmit={handleValidation}>
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
          <Button className="w-full mt-4" type="submit" disabled={isLoading}>
            Create an Account
          </Button>
        </form>
      </AuthLayout>
    </>
  );
};

export default SignUp;
