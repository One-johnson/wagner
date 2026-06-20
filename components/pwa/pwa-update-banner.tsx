"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type PwaUpdateBannerProps = {
  onRefresh: () => void;
};

export function PwaUpdateBanner({ onRefresh }: PwaUpdateBannerProps) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-[95] mx-auto max-w-lg safe-bottom">
      <div
        role="status"
        className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-card p-4 shadow-lg sm:flex-row sm:items-center"
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium">Update available</p>
          <p className="text-sm text-muted-foreground">
            A new version of Wagner Tools is ready. Refresh to load the latest
            changes.
          </p>
        </div>
        <Button size="sm" className="shrink-0" onClick={onRefresh}>
          <RefreshCw className="size-4" />
          Refresh now
        </Button>
      </div>
    </div>
  );
}
