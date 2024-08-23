import React, { useRef, lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header, Footer, ProtectedRoute } from "./components/index";
import LoadingBar from "react-top-loading-bar";
import TopLoadingBar from "./components/ui/TopLoadingBar";

// Lazy load the pages
const Cart = lazy(() => import("./pages/Cart"));
const CategoryProduct = lazy(() => import("./pages/CategoryProduct"));
const Checkout = lazy(() => import("./pages/Checkout"));
const DetailProduct = lazy(() => import("./pages/DetailProduct"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const OrderSummary = lazy(() => import("./pages/OrderSummary"));
const Payment = lazy(() => import("./pages/Payment"));
const SignUp = lazy(() => import("./pages/SignUp"));

const routes = [
  { path: "/", element: <Home />, protected: false },
  { path: "/login", element: <Login />, protected: false },
  { path: "/signup", element: <SignUp />, protected: false },
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
      <main className="min-h-[100dvh] pt-5">
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
