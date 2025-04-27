import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/reducer/userReducer";
import { Button, Input, Label, Head } from "../../components";
import { useResetPasswordMutation } from "../../redux/api/userAPI";
import { toast } from "sonner";
import AuthLayout from "../../components/layout/AuthLayout";

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
    <>
      <Head
        title="Reset Password | EZ Shop"
        description="Reset your EZ Shop password securely. Enter your new password to update your account and regain access."
      />
      <AuthLayout
        heading="Reset password"
        description="Enter a new password for your account."
        redirect="/forgot-password"
        redirectText="Back to reset password"
      >
        <form onSubmit={handleValidation}>
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
          <Button className="w-full mt-4" type="submit" disabled={isLoading}>
            Reset Password
          </Button>
        </form>
      </AuthLayout>
    </>
  );
};

export default ResetPassword;
