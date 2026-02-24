import { Link, Outlet } from "react-router";

import { Lock, MapPin, User } from "lucide-react";

import Container from "./container";

const tabs = [
  { icon: User, name: "Account Details", href: "account-details" },
  { icon: MapPin, name: "Delivery Addresses", href: "delivery-addresses" },
  { icon: Lock, name: "Update Password", href: "update-password" },
];

export default function AccountLayout() {
  return (
    <Container className="flex px-5 py-10 sm:px-8 md:px-10">
      <div className="w-fit space-y-5">
        {tabs.map((t) => (
          <Link key={t.href} to={`/account/${t.href}`} className="flex gap-2">
            <t.icon strokeWidth={1.5} className="shrink-0" />
            <span className="shrink-0">{t.name}</span>
          </Link>
        ))}
      </div>
      <div className="flex-1 px-5 md:px-8 lg:px-10">
        <Outlet />
      </div>
    </Container>
  );
}
