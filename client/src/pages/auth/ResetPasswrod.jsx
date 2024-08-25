import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../features/user/userSlice";
import { Card, Heading, Button, Input, Label, Text } from "../../components";

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
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
    <div className="flex items-center justify-center min-h-dvh">
      <Card
        className="p-5 space-y-6 sm:p-8 w-[420px] rounded-lg"
        as="form"
        onSubmit={handleValidation}
      >
        <div className="space-y-2">
          <Heading as="h2" className="text-3xl">
            Reset password
          </Heading>
          <Text>Enter a new password for your account.</Text>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label id="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <Label id="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>
        <Button className="w-full" type="submit" loading={loading}>
          Reset Password
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            className="mx-auto"
            onClick={() => navigate("/forgot-password")}
          >
            Back to reset password
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
