import { useForm } from "react-hook-form";

import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import useUserStore from "@/store/userStore";

import { useUpdateProfile } from "@/hooks/useUser";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Name can't be empty"),
  email: z.string().email("Email can't be empty"),
});

export default function AccountDetails() {
  const { mutate, isPending } = useUpdateProfile();
  const { name, email } = useUserStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name || "",
      email: email || "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };

  return (
    <div className="max-w-sm space-y-6">
      <h1 className="text-lg font-semibold sm:text-xl md:text-2xl">
        Account Details
      </h1>

      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput name="name" label="Name" control={form.control} />
        <FormInput name="email" label="Email" control={form.control} />
        <Button disabled={isPending} className="w-full">
          Save
        </Button>
      </form>
    </div>
  );
}
