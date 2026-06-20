"use client";

import { useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    []
  );

  if (!convex) return children;

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
