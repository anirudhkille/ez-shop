import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../features/user/userSlice";
import { Card, Heading, Button, Input, Label, Text } from "../../components";
import { useResetPasswordMutation } from "../../features/user/userAPI";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleValidation = async (e) => {
    e.preventDefault();
    if (!formData.newPassword) {
      toast.error("New password can't be empty");
      return;
    } else if (!formData.confirmPassword) {
      toast.error("Confirm password can't be empty");
      return;
    } else if (
      formData.confirmPassword.trim().length < 8 &&
      formData.newPassword.trim().length < 8
    ) {
      toast.error("Password must contain a minimum of 8 characters");
      return;
    } else if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password does not match");
      return;
    }
    try {
      const { newPassword } = formData; 
      const res = await resetPassword({
        token: token,
        password: newPassword,
      }).unwrap();
      dispatch(login({ userDetails: res.data })); 
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (error) {
      console.log(error); // Log the error for debugging
      let errorMessage = "Something went wrong";
      if (error.status) {
        switch (error.status) {
          case 400:
            errorMessage = "Invalid or expired reset link";
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
        <Button className="w-full" type="submit" disabled={isLoading}>
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
