import React from "react";
import { cn } from "../../utils/cn";

const Card = ({ children, className, as = "div", ...props }) => {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Card;
