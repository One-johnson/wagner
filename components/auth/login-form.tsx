"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAdminSession } from "@/components/auth/session-provider";
import { parseJsonResponse } from "@/lib/http/parse-json-response";
import { getFriendlyAuthErrorMessage } from "@/lib/friendly-errors";
import type { AdminUser } from "@/lib/auth/types";

const REMEMBER_ME_STORAGE_KEY = "wagner_remember_me";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAdminSession();
  const setupComplete = searchParams.get("setup") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(REMEMBER_ME_STORAGE_KEY);
    if (stored !== null) {
      setRememberMe(stored === "true");
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      localStorage.setItem(REMEMBER_ME_STORAGE_KEY, String(rememberMe));

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await parseJsonResponse<{
        error?: string;
        user: AdminUser;
        sessionToken: string;
      }>(res);
      if (!res.ok) {
        toast.error(getFriendlyAuthErrorMessage(data?.error ?? "Login failed"));
        return;
      }
      if (!data?.user || !data.sessionToken) {
        toast.error("We couldn't complete sign-in. Please try again.");
        return;
      }

      setSession({ user: data.user, sessionToken: data.sessionToken });
      const next = searchParams.get("next") ?? "/admin/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      toast.error("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {setupComplete ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm">
          <p className="font-medium text-primary">Account created</p>
          <p className="mt-1 text-muted-foreground">
            Sign in with the password you just set.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="admin@wagner.com"
            className="pl-9"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="pl-9"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <Label
          htmlFor="remember-me"
          className="cursor-pointer text-sm font-normal text-muted-foreground"
        >
          Remember me for 30 days
        </Label>
      </div>

      <Button type="submit" className="h-11 w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
