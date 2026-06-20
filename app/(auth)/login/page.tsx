import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>
            Wagner Vehicle Management — tool tracking system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <LoginForm />
          </Suspense>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            First time?{" "}
            <a href="/admin/setup" className="font-medium text-primary hover:underline">
              Set up the system
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
