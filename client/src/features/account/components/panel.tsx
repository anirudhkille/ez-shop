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

/** Matches the `.card` surface from the reference. */
export const PanelCard: FC<{
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}> = ({ title, action, children }) => (
  <section className="bg-card border-brand-border rounded-2xl border p-5 sm:p-6">
    {title || action ? (
      <div className="mb-4 flex items-center justify-between gap-3">
        {title ? (
          <h2 className="font-display text-foreground text-base font-bold">
            {title}
          </h2>
        ) : (
          <span />
        )}
        {action}
      </div>
    ) : null}
    {children}
  </section>
);
