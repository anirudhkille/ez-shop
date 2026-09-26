import { Link } from "react-router";

import { ArrowLeft, Lock } from "lucide-react";

import Container from "@/layout/container";
import Head from "@/layout/head";

import UpdatePasswordForm from "@/features/auth/update-password-form";

export default function UpdatePassword() {
  return (
    <>
      <Head
        title="Update Password | EZ Shop"
        description="Change your EZ Shop password. Enter your current password to choose a new one."
        noIndex
      />
      <Container className="mt-10 max-w-2xl px-5 py-16 sm:px-8 md:px-10">
        <Link
          to="/account/settings"
          className="font-body text-brand-orange hover:text-brand-orange/80 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft size={14} /> Back to settings
        </Link>

        <div className="mt-4 mb-8 flex items-start gap-4">
          <span className="bg-brand-orange/10 text-brand-orange flex size-11 shrink-0 items-center justify-center rounded-xl">
            <Lock size={20} aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-foreground text-3xl font-black tracking-wide uppercase">
              Update password
            </h1>
            <p className="font-body text-muted-foreground mt-1 text-sm">
              Choose a new password for your account.
            </p>
          </div>
        </div>

        <div className="bg-card border-brand-border rounded-2xl border p-5 sm:p-6">
          <UpdatePasswordForm />
        </div>

        <p className="font-body text-muted-foreground mt-5 text-xs leading-relaxed">
          Choose a password you do not use on any other site. You will stay
          signed in on this device afterwards.
        </p>
      </Container>
    </>
  );
}
