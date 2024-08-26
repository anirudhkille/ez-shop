import React, { useRef, lazy, Suspense, useEffect } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import { Layout, ProtectedRoute, TopLoadingBar } from "./components";

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

const NotFound = lazy(() => import("./components/layout/NotFound"));

const App = () => {
  const loadingBarRef = useRef(null);
  const location = useLocation();

  const element = useRoutes([
    {
      element: <Layout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/products/:id", element: <DetailProduct /> },
        { path: "/products/category/:name", element: <CategoryProduct /> },
        {
          path: "/cart",
          element: (
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          ),
        },
        {
          path: "/checkout",
          element: (
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          ),
        },
        {
          path: "/payment",
          element: (
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          ),
        },
        {
          path: "/order-summary",
          element: (
            <ProtectedRoute>
              <OrderSummary />
            </ProtectedRoute>
          ),
        },
      ],
    },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <SignUp /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "*", element: <NotFound /> },
  ]);

  useEffect(() => {
    loadingBarRef.current.continuousStart();
    loadingBarRef.current.complete();
  }, [location]);

  return (
    <>
      <TopLoadingBar ref={loadingBarRef} />
      <Suspense fallback={<LoadingBar />}>{element}</Suspense>
    </>
  );
};

export default App;
