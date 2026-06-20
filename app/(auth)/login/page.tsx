import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Admin sign in"
      description="Sign in to manage tools, technicians, and check-outs."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          First time?{" "}
          <a href="/admin/setup" className="font-medium text-primary hover:underline">
            Set up the system
          </a>
        </p>
      }
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
