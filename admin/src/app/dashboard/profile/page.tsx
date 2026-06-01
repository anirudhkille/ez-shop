import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm from "./ProfileForm";

export const metadata = {
  title: "Profile | Dashboard - EZ Shop Admin",
};

export default async function ProfilePage() {
  let admin = { name: "", email: "", phoneNumber: "" };

  try {
    const res = await fetch(
      `${process.env.NEXT_DOMAIN_NAME}/api/auth/profile`,
      { cache: "no-store" }
    );
    const data = await res.json();
    if (data.success) {
      admin = data.data;
    }
  } catch {
    // silent
  }

  return (
    <div className="space-y-5">
      <PageHeading title="Profile" description="Manage your profile" />

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl">
                {admin.name?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm admin={admin} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
