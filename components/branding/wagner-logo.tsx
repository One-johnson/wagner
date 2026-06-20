import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "h-8 w-auto",
  md: "h-10 w-auto",
  lg: "h-16 w-auto",
  xl: "h-24 w-auto",
} as const;

export function WagnerLogo({
  size = "md",
  showFrame = true,
  className,
}: {
  size?: keyof typeof SIZE_CLASS;
  showFrame?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        showFrame && "rounded-lg bg-black px-2 py-1.5 shadow-sm ring-1 ring-white/10",
        className
      )}
    >
      <Image
        src="/wagner-logo.png"
        alt="Wagner Vehicle Management"
        width={160}
        height={160}
        priority={size === "lg" || size === "xl"}
        className={cn("object-contain", SIZE_CLASS[size])}
      />
    </div>
  );
}
