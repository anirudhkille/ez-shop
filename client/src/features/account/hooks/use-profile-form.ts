import { useState } from "react";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { useProfile, useUpdateProfile } from "@/features/auth";
import { useUserStore } from "@/features/auth";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(1, "Phone is required"),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export const useProfileGreeting = () => {
  const { name } = useUserStore();
  const { data: profile } = useProfile();

  const displayName = profile?.name || name || "User";

  return { displayName, firstName: displayName.split(" ")[0] };
};

export const useProfileForm = () => {
  const { name, email } = useUserStore();
  const { data: profile } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "" },
  });

  const displayName = profile?.name || name || "User";
  const savedPhone = profile?.phone ?? "";

  const beginEdit = () => {
    form.reset({ name: displayName, phone: savedPhone });
    setIsEditing(true);
  };

  const cancel = () => {
    form.reset({ name: displayName, phone: savedPhone });
    setIsEditing(false);
  };

  const save = form.handleSubmit((values) => {
    updateProfile(
      { name: values.name.trim(), phone: values.phone.trim() },
      { onSuccess: () => setIsEditing(false) }
    );
  });

  return {
    form,
    isEditing,
    isPending,
    displayName,
    savedPhone,
    email: profile?.email || email,
    memberSince: profile?.createdAt,
    beginEdit,
    cancel,
    save,
  };
};
