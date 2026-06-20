"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { OfflineBanner } from "@/components/pwa/offline-banner";

export function PwaProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      void navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {
          // Registration can fail on unsupported contexts; app still works online.
        });
    }
  }, []);

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
      {children}
      <PwaInstallPrompt />
    </>
  );
}
