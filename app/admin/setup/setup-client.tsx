"use client";

import dynamic from "next/dynamic";

const SetupPanel = dynamic(
  () =>
    import("@/components/admin/setup-panel").then((mod) => mod.SetupPanel),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted-foreground">Loading setup…</p>
    ),
  }
);

export function SetupPageClient() {
  return <SetupPanel />;
}
