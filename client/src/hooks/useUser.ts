import { useNavigate } from "react-router";

import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import type { TLogin, TSignup, TUser } from "@/types/user";

import {
  changePassword,
  forgotPassword,
  postLogin,
  postSignup,
  resetPassword,
  updateProfile,
  verifySignupOTP,
} from "@/api/user";

import useAuthStore from "@/store/userStore";

export const useSignup = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (formData: TSignup) => postSignup(formData),

    onSuccess: (res, variables) => {
      toast.success(res.message || "OTP sent to your mail");

      navigate("/verify-email", {
        state: { email: variables.email },
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Signup failed");
    },
  });
};

export const useVerifySignupOTP = () => {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { email: string; otp: string }) => verifySignupOTP(data),

    onSuccess: (res) => {
      toast.success("Account verified");

      setUser({
        name: res.data.name,
        email: res.data.email,
        token: res.data.token,
      });

      navigate("/");
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Invalid OTP");
    },
  });
};

export const useLogin = () => {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (formData: TLogin) => postLogin(formData),
    onSuccess: (res) => {
      toast.success("User logged successfully");
      setUser({
        name: res.data.name,
        email: res.data.email,
        token: res.data.token,
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast.error(
        error.response.data.message || "An error occurred while creating user."
      );
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: () => {
      toast.success("Password reset link has been sent your email");
    },
    onError: (error: any) => {
      toast.error(
        error.response.data.message || "An error occurred while creating user."
      );
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
    onSuccess: () => {
      toast.success("Password reset link has been sent your email");
    },
    onError: (error: any) => {
      toast.error(
        error.response.data.message || "An error occurred while creating user."
      );
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (formData: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword(formData),
    onSuccess: () => {
      toast.success("Password updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update password"
      );
    },
  });
};

export const useUpdateProfile = () => {
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: (formData: Partial<TUser>) => updateProfile(formData),
    onSuccess: (res) => {
      toast.success("User profile updated successfully");
      setUser({
        name: res.data.name,
        email: res.data.email,
        token: res.data.token,
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response.data.message ||
          "An error occurred while updating profile."
      );
    },
  });
};
