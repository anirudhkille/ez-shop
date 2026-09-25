const STATUS_META: Record<string, { label: string; className: string }> = {
  processing: {
    label: "Processing",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  },
  shipped: {
    label: "Shipped",
    className: "border-brand-orange/20 bg-brand-orange/10 text-brand-orange",
  },
  delivered: {
    label: "Delivered",
    className: "border-green-400/20 bg-green-400/10 text-green-400",
  },
};

export const getOrderStatusMeta = (status?: string) =>
  STATUS_META[status ?? ""] ?? {
    label: status || "Unknown",
    className: "border-brand-border bg-muted/40 text-muted-foreground",
  };
