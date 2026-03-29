import { type ReactNode } from "react";

import { Link } from "react-router";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  question: string;
  redirect: string;
  redirectText: string;
};

export default function AuthLayout({
  title,
  description,
  children,
  question,
  redirect,
  redirectText,
}: AuthLayoutProps) {
  return (
    <div className="flex h-screen items-center justify-center px-3">
      <div className="bg-card w-full max-w-md rounded-2xl border p-8">
        <div className="text-center">
          <h1 className="font-display text-foreground text-4xl font-black uppercase">
            {title}
          </h1>
          <p className="font-body text-muted-foreground mt-2 text-sm">
            {description}
          </p>
        </div>
        <div>{children}</div>
        <div className="text-center">
          <p className="font-body text-muted-foreground mt-6 text-center text-sm">
            {question}
            {"  "}
            <Link
              to={redirect}
              className="text-brand-orange hover:text-brand-orange/80 font-semibold transition-colors"
            >
              {redirectText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
