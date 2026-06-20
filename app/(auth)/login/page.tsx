import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Admin sign in"
      description="Sign in to manage tools, technicians, and check-outs."
      footer={
        <AuthFormFooter>
          First time here?{" "}
          <Link href="/admin/setup" className="font-medium text-primary hover:underline">
            Create administrator account
          </Link>
        </AuthFormFooter>
      }
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
