"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthField, authInputClassName } from "@/components/auth/auth-field";
import { AuthSuccessBanner } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAdminSession } from "@/components/auth/session-provider";
import { parseJsonResponse } from "@/lib/http/parse-json-response";
import { getFriendlyAuthErrorMessage } from "@/lib/friendly-errors";
import { loginSchema, type LoginValues } from "@/lib/auth/schemas";
import type { AdminUser } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

const REMEMBER_ME_STORAGE_KEY = "wagner_remember_me";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAdminSession();
  const setupComplete = searchParams.get("setup") === "1";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const rememberMe = watch("rememberMe");

  useEffect(() => {
    const stored = localStorage.getItem(REMEMBER_ME_STORAGE_KEY);
    if (stored !== null) {
      setValue("rememberMe", stored === "true");
    }
  }, [setValue]);

  async function onSubmit(values: LoginValues) {
    try {
      localStorage.setItem(REMEMBER_ME_STORAGE_KEY, String(values.rememberMe));

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
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
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="space-y-4"
      noValidate
    >
      {setupComplete ? (
        <AuthSuccessBanner
          title="You're all set"
          description="Your administrator account was created. Sign in with the email and password you just set."
        />
      ) : null}

      <AuthField
        id="email"
        label="Email"
        icon={Mail}
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          placeholder="admin@wagner.com"
          className={authInputClassName(true, !!errors.email)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
      </AuthField>

      <AuthField
        id="password"
        label="Password"
        icon={Lock}
        error={errors.password?.message}
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          className={authInputClassName(true, !!errors.password)}
          aria-invalid={!!errors.password}
          {...register("password")}
        />
      </AuthField>

      <div className="flex items-start gap-2">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onCheckedChange={(checked) => setValue("rememberMe", checked === true)}
        />
        <div className="space-y-0.5">
          <Label
            htmlFor="remember-me"
            className="cursor-pointer text-sm font-normal leading-none"
          >
            Remember me for 30 days
          </Label>
          <p className="text-xs text-muted-foreground">
            Stay signed in on this device.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        className={cn("h-11 w-full", isSubmitting && "opacity-90")}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing you in…" : "Sign in"}
      </Button>
    </form>
  );
}
