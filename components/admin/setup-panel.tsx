"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";

export function SetupPanel() {
  const router = useRouter();
  const seeded = useQuery(api.seed.isSeeded, {});
  const bootstrap = useMutation(api.seed.bootstrap);

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (adminPassword.length < 8) {
      toast.error("Your password needs to be at least 8 characters long.");
      return;
    }
    if (adminPassword !== confirmPassword) {
      toast.error("Those passwords don't match. Please try again.");
      return;
    }
    setLoading(true);
    try {
      await bootstrap({ adminName, adminEmail, adminPassword });
      router.push("/login?setup=1");
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, "setup"));
    } finally {
      setLoading(false);
    }
  }

  if (seeded === undefined) {
    return <p className="text-sm text-muted-foreground">Checking database…</p>;
  }

  return (
    <div className="space-y-4">
      {seeded.seeded ? (
        <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
          <p className="font-medium">System already initialized</p>
          <p className="mt-1 text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{" "}
            with your admin account.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Create the first administrator account to get started.
        </p>
      )}

      <form onSubmit={(e) => void handleRegister(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-name">Full name</Label>
          <Input
            id="admin-name"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="admin@wagner.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <PasswordInput
            id="admin-password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-confirm">Confirm password</Label>
          <PasswordInput
            id="admin-confirm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || seeded.seeded}>
          {loading ? "Setting up…" : "Initialize system"}
        </Button>
      </form>
    </div>
  );
}
