import Image from "next/image";
import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";

import { toast } from "sonner";

import { ArrowUpDown } from "lucide-react";

import { clientFetch } from "@/lib/client-api";

import { RowActions } from "@/components/shared/row-actions";
import { selectColumn } from "@/components/shared/table-columns";
import { Button } from "@/components/ui/button";

import { IProduct } from "@/types";

export const columns: ColumnDef<IProduct>[] = [
  selectColumn<IProduct>(),
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const src = (row.getValue("image") as string) || "";
      return src ? (
        <Image
          height={48}
          width={48}
          src={src}
          alt="Product"
          className="h-12 w-12 rounded-md object-cover"
        />
      ) : null;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return <div>₹{price.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => <div>{row.getValue("stock") as number}</div>,
  },
  {
    accessorKey: "publish",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("publish") ? "Published" : "Draft"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original;
      return <ProductActions product={product} />;
    },
  },
];

const ProductActions = ({ product }: { product: IProduct }) => {
  const router = useRouter();

  const handleView = () => {
    router.push(`/dashboard/products/${product._id}`);
  };

  const handleDelete = async () => {
    const response = await clientFetch(`/api/product/${product._id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast.success("Product deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete product");
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
