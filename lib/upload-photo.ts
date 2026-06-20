import type { Id } from "@/convex/_generated/dataModel";

export async function uploadPhotoToConvex(
  file: File,
  generateUploadUrl: () => Promise<string>
): Promise<Id<"_storage">> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5 MB");
  }

  const uploadUrl = await generateUploadUrl();
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Photo upload failed");
  }

  const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
  return storageId;
}
