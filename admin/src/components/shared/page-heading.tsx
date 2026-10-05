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
        <h2 className="font-display text-foreground text-3xl font-bold tracking-tight uppercase">
          {title}
        </h2>
        <p className="font-body text-muted-foreground mt-1 text-sm">
          {description}
        </p>
      </div>

      {href && <LinkButton href={href}>Add New</LinkButton>}
    </div>
  );
};
