"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { PwaUpdateBanner } from "@/components/pwa/pwa-update-banner";
import { useServiceWorkerUpdate } from "@/components/pwa/use-service-worker-update";

export function PwaProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online && wasOffline) {
        toast.success("Back online — syncing latest data…");
        setWasOffline(false);
      }
      if (!online) {
        setWasOffline(true);
      }
    };

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, [wasOffline]);

  return (
    <>
      {!isOnline ? <OfflineBanner /> : null}
      {updateAvailable ? <PwaUpdateBanner onRefresh={applyUpdate} /> : null}
      {children}
      <PwaInstallPrompt />
    </>
  );
}
