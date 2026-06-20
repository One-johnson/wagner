"use client";

import type { ReactNode } from "react";
import { FadeIn } from "@/components/motion";

export function AdminPageHeader({
  title,
  description,
  actions,
  dataTour,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  dataTour?: string;
}) {
  return (
    <FadeIn
      data-tour={dataTour}
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">{actions}</div>
      ) : null}
    </FadeIn>
  );
}
