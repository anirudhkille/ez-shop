import { Separator } from "@/components/ui/separator";
import { PageHeading } from "@/components/shared/PageHeading";

export default function Loading() {
  return (
    <div className="space-y-5">
      <PageHeading
        title="Category"
        description="Manage category"
        href="/dashboard/category/new"
      />
      <Separator />
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    </div>
  );
}
