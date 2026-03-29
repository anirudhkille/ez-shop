import type { TLogin, TSignup, TUser, TVerifyEmail } from "@/types/user";

import axiosInstance from "@/lib/axiosInstance";

export const postSignup = async (formData: TSignup) => {
  const res = await axiosInstance.post("/user/signup", {
    ...formData,
  });

  return res.data;
};

export const verifySignupOTP = async (formData: TVerifyEmail) => {
  const res = await axiosInstance.post("/user/verify-signup-otp", {
    ...formData,
  });

  return res.data;
};

export const postLogin = async (formData: TLogin) => {
  const res = await axiosInstance.post("/user/login", {
    ...formData,
  });

  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await axiosInstance.post("/user/forgot-password", {
    email: email,
  });

  return res.data;
};

export const resetPassword = async (token: string, password: string) => {
  const res = await axiosInstance.put(`/user/reset-password?token=${token}`, {
    password: password,
  });

  return res.data;
};

export const updateProfile = async (formData: Partial<TUser>) => {
  const res = await axiosInstance.patch(`/user`, formData);

  return res.data;
};
