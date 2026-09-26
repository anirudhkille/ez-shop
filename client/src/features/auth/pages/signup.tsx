import Head from "@/shared/components/head";
import Divider from "@/shared/components/ui/divider";

import AuthLayout from "../components/auth-layout";
import GoogleLogin from "../components/google-login";
import SignupForm from "../components/signup-form";

export default function Signup() {
  return (
    <>
      <Head
        title="Create an Account | EZ Shop"
        description="Join EZ Shop today! Create your account by entering your email, password, and other details. Start enjoying personalized features and more."
      />
      <AuthLayout
        title="Create an account"
        description="Enter your details to create a new account"
        redirect="/login"
        question="Already have an account? "
        redirectText="Login"
      >
        <GoogleLogin />
        <Divider />
        <SignupForm />
      </AuthLayout>
    </>
  );
}
