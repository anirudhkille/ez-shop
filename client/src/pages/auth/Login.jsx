import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as userLogin } from "../../redux/reducer/userReducer";
import { Button, Input, Label, Head } from "../../components";
import { useLoginMutation } from "../../redux/api/userAPI";
import { toast } from "sonner";
import AuthLayout from "../../components/layout/AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [login, { isLoading }] = useLoginMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleValidation = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Email can't be empty");
      return;
    } else if (!formData.password) {
      toast.error("Password can't be empty");
      return;
    }

    try {
      const res = await login(formData).unwrap();
      dispatch(userLogin({ userDetails: res.data }));
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      let errorMessage = "Something went wrong";

      if (err.status) {
        switch (err.status) {
          case 401:
            errorMessage = "Invalid email or password";
            break;
          case 500:
            errorMessage = "Internal server error";
            break;
          default:
            errorMessage = "An unexpected error occurred";
        }
      }
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Head
        title="Login | EZ Shop"
        description="Access your account on EZ Shop. Enter your email and password to login securely. If you don't have an account, you can sign up for one."
      />
      <AuthLayout
        heading="Login to your account"
        description="Enter your email and password to login"
        redirect="/signup"
        redirectText="Don't have an account? Sign Up"
      >
        <form onSubmit={handleValidation}>
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
        </form>
      </AuthLayout>
    </>
  );
};

export default Login;
