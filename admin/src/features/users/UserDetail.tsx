"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IUser } from "@/models/User";
import Image from "next/image";

interface UserDetailProps {
  user: IUser;
}

export default function UserDetail({ user }: UserDetailProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("User deleted");
        router.push("/dashboard/users");
      }
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            {user.avatar ? (
              <Image
                height={80}
                width={80}
                src={user.avatar}
                alt={user.name || "User"}
                className="object-cover w-20 h-20 rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                <span className="text-2xl font-medium text-muted-foreground">
                  {(user.name || user.email)?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold">{user.name || "Unnamed"}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Phone
              </label>
              <p>{user.phone || "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Role
              </label>
              <p className="capitalize">{user.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email Verified
              </label>
              <p>{user.isEmailVerified ? "Yes" : "No"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Profile Completed
              </label>
              <p>{user.isProfileCompleted ? "Yes" : "No"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Joined
              </label>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="destructive" onClick={handleDelete}>
        Delete User
      </Button>
    </div>
  );
}
