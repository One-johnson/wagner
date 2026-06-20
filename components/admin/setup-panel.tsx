"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { AuthField, authInputClassName } from "@/components/auth/auth-field";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { SetupFormSkeleton } from "@/components/auth/setup-form-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";
import { setupSchema, type SetupValues } from "@/lib/auth/schemas";

export function SetupPanel() {
  const router = useRouter();
  const seeded = useQuery(api.seed.isSeeded, {});
  const bootstrap = useMutation(api.seed.bootstrap);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    mode: "onChange",
    defaultValues: {
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      confirmPassword: "",
    },
  });

  const adminPassword = watch("adminPassword");

  useEffect(() => {
    if (!showSuccess) return;
    const timer = window.setTimeout(() => {
      router.push("/login?setup=1");
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [showSuccess, router]);

  async function onSubmit(values: SetupValues) {
    try {
      await bootstrap({
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        adminPassword: values.adminPassword,
      });
      setShowSuccess(true);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, "setup"));
    }
  }

  if (seeded === undefined) {
    return <SetupFormSkeleton />;
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center py-6 text-center" role="status">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Account created</h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  if (seeded.seeded) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg border bg-muted/30 px-4 py-5">
          <p className="font-medium">System already initialized</p>
          <p className="mt-2 text-sm text-muted-foreground">
            An administrator account already exists. Sign in to continue.
          </p>
        </div>
        <Button className="h-11 w-full" render={<Link href="/login" />}>
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="space-y-4"
      noValidate
    >
      <p className="text-sm text-muted-foreground">
        One-time setup for Wagner Tool Management. This creates the primary
        administrator account.
      </p>

      <AuthField
        id="admin-name"
        label="Full name"
        icon={User}
        error={errors.adminName?.message}
      >
        <Input
          id="admin-name"
          autoComplete="name"
          autoFocus
          placeholder="Your name"
          className={authInputClassName(true, !!errors.adminName)}
          aria-invalid={!!errors.adminName}
          {...register("adminName")}
        />
      </AuthField>

      <AuthField
        id="admin-email"
        label="Work email"
        icon={Mail}
        error={errors.adminEmail?.message}
        hint="Used to sign in to the admin dashboard."
      >
        <Input
          id="admin-email"
          type="email"
          autoComplete="email"
          placeholder="admin@wagner.com"
          className={authInputClassName(true, !!errors.adminEmail)}
          aria-invalid={!!errors.adminEmail}
          {...register("adminEmail")}
        />
      </AuthField>

      <AuthField
        id="admin-password"
        label="Password"
        error={errors.adminPassword?.message}
        hint="At least 8 characters."
      >
        <PasswordInput
          id="admin-password"
          autoComplete="new-password"
          className={authInputClassName(false, !!errors.adminPassword)}
          aria-invalid={!!errors.adminPassword}
          {...register("adminPassword")}
        />
      </AuthField>

      <PasswordStrengthMeter password={adminPassword} />

      <AuthField
        id="admin-confirm"
        label="Confirm password"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="admin-confirm"
          autoComplete="new-password"
          className={authInputClassName(false, !!errors.confirmPassword)}
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
      </AuthField>

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? "Creating account…" : "Create administrator account"}
      </Button>
    </form>
  );
}
