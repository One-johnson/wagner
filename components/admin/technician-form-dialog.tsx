"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";

export type TechnicianRow = {
  _id: Id<"technicians">;
  name: string;
  employeeCode: string;
  photoId?: Id<"_storage"> | null;
  photoUrl?: string | null;
  isActive: boolean;
};

export function TechnicianFormDialog({
  technician,
  open,
  onOpenChange,
}: {
  technician?: TechnicianRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { sessionToken } = useAdminSession();
  const create = useMutation(api.technicians.create);
  const update = useMutation(api.technicians.update);
  const suggestedCode = useQuery(
    api.technicians.suggestEmployeeCode,
    sessionToken && open && !technician ? { sessionToken } : "skip"
  );

  const [name, setName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [photoId, setPhotoId] = useState<Id<"_storage"> | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(technician?.name ?? "");
    setEmployeeCode(technician?.employeeCode ?? suggestedCode ?? "");
    setIsActive(technician?.isActive ?? true);
    setPhotoId(technician?.photoId ?? undefined);
    setPhotoPreview(technician?.photoUrl ?? undefined);
  }, [open, technician, suggestedCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionToken || !employeeCode) return;
    setLoading(true);
    try {
      if (technician) {
        await update({
          sessionToken,
          technicianId: technician._id,
          name,
          isActive,
          photoId: photoId ?? null,
        });
        toast.success("Technician updated");
      } else {
        await create({
          sessionToken,
          name,
          employeeCode,
          photoId,
        });
        toast.success("Technician created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-md">
        <DialogHeader className="shrink-0">
          <DialogTitle>{technician ? "Edit technician" : "Add technician"}</DialogTitle>
          <DialogDescription>
            {technician
              ? "Update technician details and active status."
              : "Register a workshop technician who can borrow tools."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <PhotoUpload
              label="Photo"
              optional
              value={photoId ?? null}
              previewUrl={photoPreview ?? null}
              onChange={(id, preview) => {
                setPhotoId(id);
                setPhotoPreview(preview);
              }}
              disabled={loading}
            />
            <div className="space-y-2">
              <Label htmlFor="tech-name">Name</Label>
              <Input
                id="tech-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tech-code">Employee ID</Label>
              <Input
                id="tech-code"
                value={employeeCode}
                readOnly
                className="bg-muted/50 font-mono tracking-widest"
                placeholder={technician ? undefined : "Generating…"}
              />
              {!technician ? (
                <p className="text-xs text-muted-foreground">
                  A unique 5-digit ID is assigned automatically.
                </p>
              ) : null}
            </div>
            {technician ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
            ) : null}
          </div>
          <DialogFooter className="shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !employeeCode}>
              {loading ? "Saving…" : technician ? "Save changes" : "Add technician"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
