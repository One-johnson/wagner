"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminSession } from "@/components/auth/session-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";

export function ReturnToolDialog({
  checkout,
  open,
  onOpenChange,
}: {
  checkout: {
    _id: Id<"activeCheckouts">;
    toolName: string;
    assetTag: string;
    technicianName: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { sessionToken } = useAdminSession();
  const returnTool = useMutation(api.checkouts.returnTool);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!sessionToken || !checkout) return;
    setLoading(true);
    try {
      await returnTool({
        sessionToken,
        checkoutId: checkout._id,
        conditionAtEvent: "good",
      });
      toast.success("Tool returned");
      onOpenChange(false);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Return tool"
      description={
        checkout
          ? `Mark ${checkout.assetTag} (${checkout.toolName}) as returned from ${checkout.technicianName}?`
          : ""
      }
      confirmLabel="Return tool"
      variant="default"
      loading={loading}
      onConfirm={handleConfirm}
    />
  );
}
