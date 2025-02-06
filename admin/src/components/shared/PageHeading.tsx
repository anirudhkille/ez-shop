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
    <div className="flex items-end justify-between w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {href && <LinkButton href={href}>Add New</LinkButton>}
    </div>
  );
};
