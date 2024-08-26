import React from "react";
import { Outlet } from "react-router-dom";
import { Header, Footer } from "../index";

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
