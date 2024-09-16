import React from "react";
import { cn } from "../../utils/cn";

const Text = ({ as = "p", children, className, ...props }) => {
  const Tag = as;

  return <Tag {...props} className={cn("text-muted-foreground",className)}>{children}</Tag>;
};

export default Text;
