import { Route, Routes } from "react-router";
import { lazy, Suspense } from "react";
import Layout from "./layout/Layout";
import RedirectIfAuthenticated from "./layout/RedirectIfAuthenticated";
import ProtectedRoute from "./layout/ProtectedRoute";
import NotFound from "./pages/not-found";

const Home = lazy(() => import("./pages/home"));
const CategoryProduct = lazy(() => import("./pages/category-product"));
const DetailProduct = lazy(() => import("./pages/detail-product"));
const Cart = lazy(() => import("./pages/cart"));
const Checkout = lazy(() => import("./pages/checkout"));
const Payment = lazy(() => import("./pages/payment"));
const OrderSummary = lazy(() => import("./pages/order-summary"));

const Login = lazy(() => import("./pages/auth/login"));
const Signup = lazy(() => import("./pages/auth/signup"));
const ForgotPassword = lazy(() => import("./pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Routes>
        <Route element={<RedirectIfAuthenticated />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<DetailProduct />} />
          <Route
            path="/products/category/:name"
            element={<CategoryProduct />}
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-summary" element={<OrderSummary />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
