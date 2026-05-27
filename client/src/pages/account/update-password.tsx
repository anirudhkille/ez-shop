import { useState } from "react";

import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { Link } from "react-router";

import { useUpdatePassword } from "@/hooks/useUser";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Container from "@/layout/container";
import Head from "@/layout/head";

export default function UpdatePassword() {
  const { mutate: updatePassword, isPending } = useUpdatePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    updatePassword({ currentPassword, newPassword });
  };

  const isValid =
    currentPassword.trim() &&
    newPassword.trim() &&
    confirmPassword.trim() &&
    newPassword === confirmPassword;

  return (
    <>
      <Head title="Update Password | EZ Shop" />
      <Container className="max-w-2xl px-5 py-16 sm:px-8 md:px-10">
        <div className="mb-8">
          <Link
            to="/profile"
            className="font-body text-sm text-brand-orange hover:text-brand-orange/80 mb-4 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Profile
          </Link>
        </div>

        <Card className="bg-card border-brand-border">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <Lock className="text-brand-orange h-8 w-8" />
            </div>
            <CardTitle className="font-display text-foreground text-center text-2xl font-bold tracking-tight">
              Update Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="text-foreground mb-2 block text-sm font-medium"
                >
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full bg-background pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="text-foreground mb-2 block text-sm font-medium"
                >
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full bg-background pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-foreground mb-2 block text-sm font-medium"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className={`w-full bg-background pr-10 ${
                      confirmPassword && newPassword !== confirmPassword
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-destructive mt-1 text-xs">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!isValid || isPending}
                className="w-full bg-brand-orange text-white hover:bg-brand-orange/90"
              >
                {isPending ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
