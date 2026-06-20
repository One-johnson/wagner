import { cn } from "@/lib/utils";

export function TablePhotoCell({
  url,
  alt,
  className,
}: {
  url: string | null | undefined;
  alt: string;
  className?: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        className={cn("size-10 rounded-md border object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-10 items-center justify-center rounded-md border bg-muted/50 text-xs text-muted-foreground",
        className
      )}
      aria-hidden
    >
      —
    </div>
  );
}
