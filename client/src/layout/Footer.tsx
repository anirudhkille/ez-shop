import { Github, Linkedin } from "lucide-react";
import { Link } from "react-router";

const menus = [
  { href: "/products/?new-featured", name: "New & Featured" },
  { href: "/products/?gender=men", name: "Men" },
  { href: "/products/?gender=women", name: "Women" },
  { href: "sale", name: "Sale" },
];

const help = [
  { href: "order-status", name: "Order Status" },
  { href: "cart", name: "Cart" },
  { href: "login", name: "Login" },
  { href: "signup", name: "Signup" },
];

const socials = [
  { icon: Github, href: "https://github.com/anirudhkille" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/anirudh-kille" },
];

export default function Footer() {
  return (
    <footer className="bg-background text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="logo" height={35} width={35} />
              <span className="text-xl font-bold">EZ Shop</span>
            </Link>

            <div  className="flex gap-3 items-center mt-3">
              {socials.map((s, idx) => (
                <Link key={idx} target="_blank" to={s.href}>
                  <s.icon />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4 uppercase">Get Help</h3>
            <ul className="space-y-3 text-sm font-medium text-muted-foreground">
              {help.map((m) => (
                <li key={m.name}>
                  <Link to={m.href}>{m.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4 uppercase">Quick Links</h3>
            <ul className="space-y-3 text-sm font-medium text-muted-foreground">
              {menus.map((m) => (
                <li key={m.name}>
                  <Link to={m.href}>{m.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t pt-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 EZ Shop, Inc. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
