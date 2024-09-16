import React from "react";
import { cn } from "../../utils/cn";

const Heading = ({ as = "h2", children, className, ...props }) => {
  const Tag = as;

  return (
    <Tag className={cn("text-accent-foreground font-bold", className)} {...props}>
      {children}
    </Tag>
  );
};

export default Heading;
