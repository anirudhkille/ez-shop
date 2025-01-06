import React from "react";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  if (
    pathname !== "/" &&
    pathname !== "/forgot-password" &&
    pathname !== "/reset-password"
  )
    return (
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <Header />
          <div className="p-3 sm:p-5 md:px-8">{children}</div>
        </main>
      </SidebarProvider>
    );

  return <main className="w-full">{children}</main>;
};

export default Layout;
