import { AuthShell } from "@/components/auth/auth-shell";
import { SetupPageClient } from "./setup-client";

export const metadata = {
  title: "Setup",
};

export default function SetupPage() {
  return (
    <AuthShell
      title="System setup"
      description="Create the first administrator account to get started."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already set up?{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </a>
        </p>
      }
    >
      <SetupPageClient />
    </AuthShell>
  );
}
