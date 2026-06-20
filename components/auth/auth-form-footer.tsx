import { Separator } from "@/components/ui/separator";

export function AuthFormFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 pt-2">
      <Separator />
      <div className="text-center text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
