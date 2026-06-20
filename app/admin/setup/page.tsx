import type { Metadata } from "next";
import Link from "next/link";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { AuthShell } from "@/components/auth/auth-shell";
import { SetupPageClient } from "./setup-client";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default function SetupPage() {
  return (
    <AuthShell
      title="Create administrator account"
      description="One-time setup for Wagner Tool Management."
      footer={
        <AuthFormFooter>
          Already set up?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </AuthFormFooter>
      }
    >
      <SetupPageClient />
    </AuthShell>
  );
}
