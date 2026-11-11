import Image from "next/image";
import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";

import { toast } from "sonner";

import { clientFetch } from "@/lib/client-api";

import { RowActions } from "@/components/shared/row-actions";
import { selectColumn } from "@/components/shared/table-columns";

import { ICategory } from "@/types";

export const columns: ColumnDef<ICategory>[] = [
  selectColumn<ICategory>(),
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <Image
        height={48}
        width={48}
        src={(row.getValue("image") as string) || ""}
        alt="Category"
        className="h-12 w-12 rounded-md object-cover"
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original;
      return <CategoryActions category={category} />;
    },
  },
];

const CategoryActions = ({ category }: { category: ICategory }) => {
  const router = useRouter();

  const handleView = () => {
    router.push(`/dashboard/category/${category._id}`);
  };

  const handleDelete = async () => {
    const response = await clientFetch(`/api/category/${category._id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast.success("Category deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete category");
    }
  };

  return (
    <RowActions
      actions={[
        { label: "View", onSelect: handleView },
        { label: "Delete", onSelect: handleDelete },
      ]}
    />
  );
};
