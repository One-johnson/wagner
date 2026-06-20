"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useAdminSession } from "@/components/auth/session-provider";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";

export function ProfilePanel() {
  const { user, sessionToken, setSession } = useAdminSession();
  const updateProfile = useMutation(api.auth.updateProfile);
  const changePassword = useMutation(api.auth.changePassword);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionToken) return;

    setProfileLoading(true);
    try {
      const updated = await updateProfile({ sessionToken, name, email });
      setSession({ user: updated, sessionToken });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionToken) return;

    if (newPassword.length < 8) {
      toast.error("Your password needs to be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Those passwords don't match. Please try again.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        sessionToken,
        currentPassword,
        newPassword,
      });
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!user) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminPageHeader
        title="Profile"
        description="Manage your account details and password"
        dataTour="page-profile"
      />

      <Card>
        <form onSubmit={(e) => void handleProfileSubmit(e)}>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>
              Update the name and email shown across the admin app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wagner.com"
                autoComplete="email"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <form onSubmit={(e) => void handlePasswordSubmit(e)}>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>
              Choose a new password with at least 8 characters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <PasswordInput
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Updating…" : "Change password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
