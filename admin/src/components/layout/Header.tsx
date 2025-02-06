"use client";
import { SidebarTrigger } from "../ui/sidebar";
import ThemeToggle from "./ThemeToggle";
import AccountMenu from "./AccountMenu";
import BreadCrumbs from "../shared/Breadcrumbs";
import { Separator } from "../ui/separator";

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 z-50">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation='vertical' className='h-4 mr-2' />
        <BreadCrumbs />
      </div>

      <div className="flex items-center gap-2 px-4 bg-blue">
        <AccountMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}
