import React from "react";
import { cn } from "../../utils/cn";

const Label = ({ className, children, id, ...props }) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        "text-primary font-medium text-sm",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
