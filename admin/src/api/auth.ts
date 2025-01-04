import { Login, ResetPassword } from "@/types/api";

export const postLogin = async (formData: Login) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to login");
  }
  return res.json();
};

export const postForgotPassword = async (email: string) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/admin/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email}),
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to login");
  }
  return res.json();
};

export const putResetPassword = async (formData: ResetPassword) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/admin/reset-password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to login");
  }
  return res.json();
};
