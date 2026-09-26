import { type ReactNode } from "react";

import { Link } from "react-router";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  question: string;
  redirect: string;
  redirectText: string;
  /** Drops the margin-based spacing when a page supplies its own rhythm. */
  flush?: boolean;
};

export default function AuthLayout({
  title,
  description,
  children,
  question,
  redirect,
  redirectText,
  flush = false,
}: AuthLayoutProps) {
  return (
    <div className="flex h-screen items-center justify-center px-3">
      <div className="bg-card w-full max-w-md rounded-2xl border p-8">
        <div className="text-center">
          <h1 className="font-display text-foreground text-4xl font-black uppercase">
            {title}
          </h1>
          <p
            className={`font-body text-muted-foreground text-sm ${
              flush ? "" : "mt-2"
            }`}
          >
            {description}
          </p>
        </div>
        <div className={flush ? "flex flex-col gap-6" : undefined}>
          {children}
        </div>
        <div className="text-center">
          <p
            className={`font-body text-muted-foreground text-center text-sm ${
              flush ? "pt-6" : "mt-6"
            }`}
          >
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
