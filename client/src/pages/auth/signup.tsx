import AuthLayout from "@/layout/auth-layout";
import Head from "@/layout/head";

import GoogleLogin from "@/features/auth/google-login";
import SignupForm from "@/features/auth/signup-form";
import Divider from "@/shared/components/ui/divider";

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
