import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./layout/Layout.tsx";

const Login = lazy(() => import("./pages/auth/Login"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
