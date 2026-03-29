import AuthLayout from "@/layout/auth-layout";
import Head from "@/layout/head";

import GoogleLogin from "@/features/auth/google-login";
import SignupForm from "@/features/auth/signup-form";

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
        <div className="my-6 flex items-center gap-3">
          <div className="bg-brand-border h-px flex-1" />
          <span className="font-body text-muted-foreground text-xs tracking-widest uppercase">
            or
          </span>
          <div className="bg-brand-border h-px flex-1" />
        </div>
        <SignupForm />
      </AuthLayout>
    </>
  );
}
