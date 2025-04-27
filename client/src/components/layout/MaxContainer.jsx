import React from "react";
import { cn } from "../../utils/cn";

export default function MaxContainer({ children, className }) {
  return <div className={cn(`max-w-[1800px] mx-auto`, className)}>{children}</div>;
}
