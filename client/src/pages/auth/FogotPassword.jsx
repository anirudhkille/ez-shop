import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Heading,
  Button,
  Input,
  Label,
  Text,
  Head,
} from "../../components";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "../../redux/api/userAPI";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");

  const handleValidation = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Email can't be empty");
      return;
    }

    try {
      const res = await forgotPassword({ email: trimmedEmail }).unwrap();
      if (res) toast.success("Password reset link has been sent your email");
    } catch (error) {
      console.log(error);
      let errorMessage = "Something went wrong";
      if (error.status) {
        switch (error.status) {
          case 404:
            errorMessage = "User with email doesn't exist";
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
        title="Forgot Password | EZ Shop"
        description="Trouble logging in? Enter your email to reset your password and regain access to your EZ Shop account."
      />
      <div className="flex items-center justify-center min-h-dvh">
        <Card
          className="p-5 space-y-6 sm:p-8 w-[420px] rounded-lg"
          as="form"
          onSubmit={handleValidation}
        >
          <div className="space-y-2">
            <Heading as="h2" className="text-3xl">
              Forgot password
            </Heading>
            <Text>
              Enter your email address below and we'll send you a link to reset
              your password
            </Text>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label id="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              onClick={() => navigate("/login")}
            >
              Remember your password? Login
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ForgotPassword;
