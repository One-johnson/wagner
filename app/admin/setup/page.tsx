import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SetupPageClient } from "./setup-client";

export const metadata = {
  title: "Setup",
};

export default function SetupPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>System setup</CardTitle>
          <CardDescription>
            Initialize Wagner Tool Management with an admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetupPageClient />
        </CardContent>
      </Card>
    </div>
  );
}
