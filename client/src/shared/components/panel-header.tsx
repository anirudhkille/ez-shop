import type { FC, ReactNode } from "react";

/** Matches the `.panel-head` block from the ez-shop-profile.html reference. */
export const PanelHeader: FC<{
  title: string;
  subtitle?: string;
  action?: ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="font-display text-foreground text-2xl font-bold">
        {title}
      </h1>
      {subtitle ? (
        <p className="font-body text-muted-foreground mt-1 text-sm">
          {subtitle}
        </p>
      ) : null}
    </div>
    {action}
  </div>
);
