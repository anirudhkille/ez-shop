import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Header from "@/components/layout/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <section className="w-full">
        <Header />
        <div className="p-3 sm:p-5 md:px-8">{children}</div>
      </section>
    </SidebarProvider>
  );
}
