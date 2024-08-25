import React, { useRef, lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header, Footer, ProtectedRoute } from "./components/index";
import LoadingBar from "react-top-loading-bar";
import TopLoadingBar from "./components/ui/TopLoadingBar";

// Lazy load the pages
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/auth/FogotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPasswrod"));

const Cart = lazy(() => import("./pages/Cart"));
const CategoryProduct = lazy(() => import("./pages/CategoryProduct"));
const Checkout = lazy(() => import("./pages/Checkout"));
const DetailProduct = lazy(() => import("./pages/DetailProduct"));
const Home = lazy(() => import("./pages/Home"));
const OrderSummary = lazy(() => import("./pages/OrderSummary"));
const Payment = lazy(() => import("./pages/Payment"));

const routes = [
  { path: "/login", element: <Login />, protected: false },
  { path: "/signup", element: <SignUp />, protected: false },
  { path: "/forgot-password", element: <ForgotPassword />, protected: false },
  { path: "/reset-password", element: <ResetPassword />, protected: false },
  { path: "/", element: <Home />, protected: false },
  { path: "/products/:id", element: <DetailProduct />, protected: false },
  {
    path: "/products/category/:name",
    element: <CategoryProduct />,
    protected: false,
  },
  { path: "/cart", element: <Cart />, protected: true },
  { path: "/checkout", element: <Checkout />, protected: true },
  { path: "/payment", element: <Payment />, protected: true },
  { path: "/order-summary", element: <OrderSummary />, protected: true },
];

const App = () => {
  const loadingBarRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    loadingBarRef.current.continuousStart();
    loadingBarRef.current.complete();
  }, [location]);

  return (
    <>
      <TopLoadingBar ref={loadingBarRef} />
      <Header />
      <main className="min-h-dvh">
        <Suspense fallback={<LoadingBar />}>
          <Routes>
            {routes.map((r) =>
              r.protected ? (
                <Route
                  key={r.path}
                  path={r.path}
                  element={<ProtectedRoute>{r.element}</ProtectedRoute>}
                />
              ) : (
                <Route key={r.path} path={r.path} element={r.element} />
              )
            )}
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
};

export default App;
