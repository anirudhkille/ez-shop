import { Outlet } from "react-router";

import Footer from "./footer";
import Header from "./Header";

export default function Layout() {
  return (
    <>
      <Header />
      <main className="min-h-dvh">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
