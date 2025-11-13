import { Outlet } from "react-router";
import Header from "./header";
import Footer from "./footer";

const Layout = () => {
  return (
    <>
      <Header />
      <main className="min-h-dvh">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
