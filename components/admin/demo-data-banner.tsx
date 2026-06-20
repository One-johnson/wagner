"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useAdminSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";

export function DemoDataBanner() {
  const { sessionToken } = useAdminSession();
  const demo = useQuery(
    api.inventory.hasDemoData,
    sessionToken ? { sessionToken } : "skip"
  );
  const clearDemo = useMutation(api.inventory.clearDemoData);
  const [clearing, setClearing] = useState(false);

  if (!demo?.hasDemo) return null;

  async function handleClear() {
    if (!sessionToken) return;
    setClearing(true);
    try {
      const result = await clearDemo({ sessionToken });
      toast.success(
        `Removed ${result.toolsRemoved} sample tools and ${result.techniciansRemoved} sample technicians`
      );
    } catch (err) {
      toast.error(
        getFriendlyErrorMessage(err, "general", "Could not remove sample data")
      );
    } finally {
      setClearing(false);
    }
  }

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium">Sample data detected</p>
          <p className="text-sm text-muted-foreground">
            {demo.demoTools} tools and {demo.demoTechnicians} technicians from the old
            setup seed are still in your database. Remove them to start with your own
            inventory.
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 border-amber-500/40 hover:bg-amber-500/10"
          onClick={() => void handleClear()}
          disabled={clearing}
        >
          <Trash2 className="size-4" />
          {clearing ? "Removing…" : "Remove sample data"}
        </Button>
      </CardContent>
    </Card>
  );
}
