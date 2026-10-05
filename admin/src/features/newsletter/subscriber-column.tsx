import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { INewsletterSubscriber } from "@/types";
import { toast } from "sonner";

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-IN") : null;

export const columns: ColumnDef<INewsletterSubscriber>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="font-medium">{row.getValue("email")}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Subscribed",
    cell: ({ row }) => {
      const date = formatDate(row.getValue("createdAt") as string | undefined);
      return (
        <span className={date ? undefined : "text-muted-foreground"}>
          {date ?? "Unknown"}
        </span>
      );
    },
  },
  {
    id: "copy",
    header: "",
    cell: ({ row }) => <CopyEmail email={row.original.email} />,
    enableSorting: false,
  },
];

const CopyEmail = ({ email }: { email: string }) => {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success("Email copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy the email");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={copy}
      className="text-muted-foreground hover:text-foreground"
      aria-label={`Copy ${email}`}
    >
      <Mail size={14} />
      {copied ? "Copied" : "Copy"}
    </Button>
  );
};
