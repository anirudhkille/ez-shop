import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

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
