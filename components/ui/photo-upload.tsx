"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { uploadPhotoToConvex } from "@/lib/upload-photo";

export function PhotoUpload({
  label,
  optional,
  value,
  previewUrl,
  onChange,
  disabled,
}: {
  label: string;
  optional?: boolean;
  value?: Id<"_storage"> | null;
  previewUrl?: string | null;
  onChange: (photoId: Id<"_storage"> | undefined, preview: string | undefined) => void;
  disabled?: boolean;
}) {
  const { sessionToken } = useAdminSession();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [localPreview, setLocalPreview] = React.useState<string | null>(null);

  const displayUrl = localPreview ?? previewUrl ?? null;

  async function handleFile(file: File) {
    if (!sessionToken) return;
    setUploading(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
      const storageId = await uploadPhotoToConvex(file, async () => {
        const url = await generateUploadUrl({ sessionToken });
        return url;
      });
      onChange(storageId, objectUrl);
    } catch (err) {
      setLocalPreview(null);
      onChange(undefined, undefined);
      toast.error(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setUploading(false);
    }
  }

  function clearPhoto() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onChange(undefined, undefined);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
        ) : null}
      </Label>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30",
            !displayUrl && "border-dashed"
          )}
        >
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : displayUrl ? "Change photo" : "Upload photo"}
          </Button>
          {(displayUrl || value) && !uploading ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearPhoto}>
              <X className="size-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
