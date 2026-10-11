import { LinkButton } from "../ui/link";

interface PageHeadingProps {
  title: string;
  description: string;
  href?: string;
}

export const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  description,
  href,
}) => {
  return (
    <div className="flex w-full flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground uppercase">
          {title}
        </h2>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {href && <LinkButton href={href}>Add New</LinkButton>}
    </div>
  );
};
