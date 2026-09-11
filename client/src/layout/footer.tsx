import { Link } from "react-router";

import { Github, Instagram, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
  ],

  Account: [
    { label: "Profile", href: "/profile" },
    {
      label: "Delivery Addresses",
      href: "/account/delivery-addresses",
    },
    {
      label: "Update Password",
      href: "/account/update-password",
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

const socials = [
  {
    icon: Github,
    label: "Github",
    href: "https://github.com/anirudhkille",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/anirudh-kille",
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://www.instagram.com/anirudh_kille",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:anirudhkille@gmail.com",
  },
];

export default function Footer() {
  return (
    <footer className="border-brand-border bg-card border-t">
      <div className="mx-auto max-w-350 px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <img src="/logo.svg" className="size-6 object-contain" />

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
                  className="border-brand-border text-muted-foreground hover:text-brand-orange hover:border-brand-orange/40 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200"
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-display text-foreground mb-4 text-sm font-bold tracking-widest uppercase">
                {section}
              </h4>
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
