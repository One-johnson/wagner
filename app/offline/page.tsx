import Link from "next/link";
import { WagnerLogo } from "@/components/branding/wagner-logo";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-950 p-6 text-center">
      <WagnerLogo size="lg" />
      <h1 className="mt-8 text-2xl font-semibold text-zinc-50">You&apos;re offline</h1>
      <p className="mt-3 max-w-sm text-sm text-zinc-400">
        Wagner Tool Management needs an internet connection to load inventory and
        record check-outs. Reconnect, then open the app again.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          render={<Link href="/login" />}
          className="min-h-11 min-w-[140px]"
        >
          Try again
        </Button>
      </div>
      <p className="mt-6 text-xs text-zinc-500">
        Installed app pages you already visited may open from cache, but live data
        will refresh when you&apos;re back online.
      </p>
    </div>
  );
}
