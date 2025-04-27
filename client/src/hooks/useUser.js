import { useMutation } from "@tanstack/react-query";
import { signup, login, forgotPassword, resetPassword } from "../api/userAPI";

export const useSignup = () => {
  return useMutation({
    mutationFn: signup,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  });
};
