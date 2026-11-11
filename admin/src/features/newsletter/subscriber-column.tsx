import * as React from "react";

import { ColumnDef } from "@tanstack/react-table";

import { toast } from "sonner";

import { Mail } from "lucide-react";

import { formatDate } from "@/lib/format-date";

import { Button } from "@/components/ui/button";
import { selectColumn } from "@/components/shared/table-columns";

import { INewsletterSubscriber } from "@/types";

export const columns: ColumnDef<INewsletterSubscriber>[] = [
  selectColumn<INewsletterSubscriber>(),
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Subscribed",
    cell: ({ row }) => {
      const value = row.getValue("createdAt") as string | undefined;
      return (
        <span className={value ? undefined : "text-muted-foreground"}>
          {formatDate(value, "Unknown")}
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
