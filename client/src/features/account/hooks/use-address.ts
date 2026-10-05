import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import type { TAddress } from "@/features/account";
import { useUserStore } from "@/features/auth";
import { getErrorMessage } from "@/shared/lib/api-error";

import {
  deleteAddress,
  getAddresses,
  postAddress,
  updateAddress,
} from "../api/address";

export const useAddresss = () => {
  const { token } = useUserStore();
  return useQuery({
    queryFn: getAddresses,
    queryKey: ["address"],
    placeholderData: keepPreviousData,
    enabled: !!token,
  });
};

export const usePostAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: TAddress) => postAddress(formData),
    onSuccess: () => {
      toast.success("Address created successfully");
      queryClient.invalidateQueries({ queryKey: ["address"] });
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "An error occurred while creating address")
      );
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      formData,
      id,
    }: {
      formData: Partial<TAddress>;
      id: string;
    }) => updateAddress(formData, id),
    onSuccess: () => {
      toast.success("Address updated successfully");
      queryClient.invalidateQueries({ queryKey: ["address"] });
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "An error occurred while updated address")
      );
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["address"] });
      toast.success("Address deleted successfully");
    },
    onError: (error) => {
      console.error("Delete failed", error);
    },
  });
};
