import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import type { TAddress } from "@/types/address";

import {
  deleteAddress,
  getAddresses,
  postAddress,
  updateAddress,
} from "@/api/address";

export const useAddresss = () => {
  return useQuery({
    queryFn: getAddresses,
    queryKey: ["address"],
    placeholderData: keepPreviousData,
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
    onError: (error: any) => {
      toast.error(
        error.response.data.message ||
          "An error occurred while creating address"
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
    onError: (error: any) => {
      toast.error(
        error.response.data.message || "An error occurred while updated address"
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
    onError: (error: any) => {
      console.error("Delete failed", error);
    },
  });
};
