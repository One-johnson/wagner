"use client";

import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-amber-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow-md safe-top"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden />
      <span>
        You&apos;re offline. Viewing cached pages only — sign in and data changes
        need a connection.
      </span>
    </div>
  );
}
