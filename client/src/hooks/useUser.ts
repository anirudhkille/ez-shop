import {
  forgotPassword,
  postLogin,
  postSignup,
  resetPassword,
} from "@/api/user";
import useAuthStore from "@/store/userStore";
import type { TLogin, TSignup } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSignup = () => {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: (formData: TSignup) => postSignup(formData),
    onSuccess: (res) => {
      toast.success("User created successfully");
      login({
        token: res.data.token,
        name: res.data.name,
        email: res.data.email,
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response.data.message || "An error occurred while creating user."
      );
    },
  });
};

export const useLogin = () => {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: (formData: TLogin) => postLogin(formData),
    onSuccess: (res) => {
      toast.success("User logged successfully");
      login({
        token: res.data.token,
        name: res.data.name,
        email: res.data.email,
      });
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
