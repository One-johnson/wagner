"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";
import type { ToolRow } from "@/components/admin/tools-panel";

export function ToolFormDialog({
  tool,
  categories,
  open,
  onOpenChange,
}: {
  tool?: ToolRow;
  categories: { _id: Id<"toolCategories">; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { sessionToken } = useAdminSession();
  const create = useMutation(api.tools.create);
  const update = useMutation(api.tools.update);
  const [name, setName] = useState("");
  const [assetTag, setAssetTag] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<ToolRow["status"]>("available");
  const [conditionNotes, setConditionNotes] = useState("");
  const [photoId, setPhotoId] = useState<Id<"_storage"> | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(tool?.name ?? "");
    setAssetTag(tool?.assetTag ?? "");
    setBarcode(tool?.barcode ?? "");
    setCategoryId(tool?.categoryId ?? "");
    setStatus(tool?.status ?? "available");
    setConditionNotes(tool?.conditionNotes ?? "");
    setPhotoId(tool?.photoId ?? undefined);
    setPhotoPreview(tool?.photoUrl ?? undefined);
  }, [open, tool]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionToken) return;
    setLoading(true);
    try {
      if (tool) {
        await update({
          sessionToken,
          toolId: tool._id,
          name,
          assetTag,
          barcode: barcode || undefined,
          photoId: photoId ?? null,
          categoryId: categoryId ? (categoryId as Id<"toolCategories">) : undefined,
          status,
          conditionNotes: conditionNotes || undefined,
        });
        toast.success("Tool updated");
      } else {
        await create({
          sessionToken,
          name,
          assetTag,
          barcode: barcode || undefined,
          photoId,
          categoryId: categoryId ? (categoryId as Id<"toolCategories">) : undefined,
          conditionNotes: conditionNotes || undefined,
        });
        toast.success("Tool created");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tool ? "Edit tool" : "Add tool"}</DialogTitle>
          <DialogDescription>
            {tool
              ? "Update tool details and status."
              : "Register a new tool in the inventory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <PhotoUpload
            label="Tool photo"
            value={photoId ?? null}
            previewUrl={photoPreview ?? null}
            onChange={(id, preview) => {
              setPhotoId(id);
              setPhotoPreview(preview);
            }}
            disabled={loading}
          />
          <div className="space-y-2">
            <Label htmlFor="tool-name">Name</Label>
            <Input
              id="tool-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tool-asset-tag">Asset tag</Label>
            <Input
              id="tool-asset-tag"
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tool-barcode">Barcode (optional)</Label>
            <Input
              id="tool-barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {tool ? (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus((v ?? "available") as ToolRow["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["available", "checked_out", "maintenance", "lost", "retired"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="tool-notes">Condition notes</Label>
            <Input
              id="tool-notes"
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : tool ? "Save changes" : "Add tool"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
