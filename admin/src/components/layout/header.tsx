"use client";

import BreadCrumbs from "../shared/breadcrumbs";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import AccountMenu from "./account-menu";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-brand-border/40 bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadCrumbs />
      </div>

      <div className="flex items-center gap-2 px-4">
        <AccountMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}
