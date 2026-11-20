import type { ComponentType } from "react";

import { Link } from "react-router";

import { Mail } from "lucide-react";

type SocialIconProps = {
  size?: number;
};

type SocialIcon = ComponentType<SocialIconProps>;

function GithubIcon({ size = 15 }: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3-.405c1.02.005 2.045.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedinIcon({ size = 15 }: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

function InstagramIcon({ size = 15 }: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
    </svg>
  );
}

function MailIcon({ size = 15 }: SocialIconProps) {
  return <Mail size={size} aria-hidden="true" />;
}

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Wishlist", href: "/account/saved" },
    { label: "Cart", href: "/cart" },
  ],

  Account: [
    { label: "Account", href: "/account" },
    {
      label: "Delivery Addresses",
      href: "/account/addresses",
    },
    {
      label: "Update Password",
      href: "/account/password",
    },
  ],

  Orders: [
    { label: "Track Order", href: "/track-order" },
    { label: "Returns", href: "/returns" },
    { label: "Shipping Info", href: "/shipping-info" },
  ],

  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Cookie Policy", href: "/cookie-policy" },
  ],
};

const socials: { icon: SocialIcon; label: string; href: string }[] = [
  {
    icon: GithubIcon,
    label: "Github",
    href: "https://github.com/anirudhkille",
  },
  {
    icon: LinkedinIcon,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/anirudh-kille",
  },
  {
    icon: InstagramIcon,
    label: "Instagram",
    href: "https://www.instagram.com/anirudh_kille",
  },
  {
    icon: MailIcon,
    label: "Email",
    href: "mailto:anirudhkille@gmail.com",
  },
];

export function Footer() {
  return (
    <footer className="border-brand-border bg-card border-t">
      <div className="mx-auto max-w-350 px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="EZ Shop Logo"
                className="size-6 object-contain"
              />

              <span className="font-display text-foreground text-2xl font-bold tracking-wider">
                EZ Shop
              </span>
            </Link>

            <p className="font-body text-muted-foreground max-w-xs text-sm leading-relaxed">
              Premium footwear & apparel. Engineered for performance, designed
              for everyday life.
            </p>

            <div className="mt-6 flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="border-brand-border text-muted-foreground hover:text-brand-orange hover:border-brand-orange/40 flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200"
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="font-display text-foreground mb-4 text-sm font-bold tracking-widest uppercase">
                {section}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="font-body text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-brand-border border-t py-6 text-center">
          <p className="font-body text-muted-foreground text-sm">
            © 2026 EZ Shop. All rights reserved. Powered by{" "}
            <a target="_blank" href="https://anirudhkille.com">
              Anirudh Kille
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
