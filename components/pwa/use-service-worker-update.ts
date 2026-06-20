"use client";

import { useCallback, useEffect, useState } from "react";

const RELOADING_KEY = "wagner_pwa_reloading";

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const applyUpdate = useCallback(() => {
    sessionStorage.setItem(RELOADING_KEY, "1");
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    if (sessionStorage.getItem(RELOADING_KEY) === "1") {
      sessionStorage.removeItem(RELOADING_KEY);
      return;
    }

    let registration: ServiceWorkerRegistration | undefined;
    let hadController = Boolean(navigator.serviceWorker.controller);

    function markUpdateAvailable() {
      setUpdateAvailable(true);
    }

    function onControllerChange() {
      if (hadController) {
        markUpdateAvailable();
      }
      hadController = true;
    }

    function trackInstalling(worker: ServiceWorker) {
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          markUpdateAvailable();
        }
      });
    }

    function checkForUpdate() {
      void registration?.update();
    }

    async function register() {
      try {
        registration = await navigator.serviceWorker.register("/sw.js");

        if (registration.waiting && navigator.serviceWorker.controller) {
          markUpdateAvailable();
        }

        if (registration.installing) {
          trackInstalling(registration.installing);
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration?.installing;
          if (worker) trackInstalling(worker);
        });

        await registration.update();
      } catch {
        // Registration can fail on unsupported contexts.
      }
    }

    void register();

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    window.addEventListener("focus", checkForUpdate);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkForUpdate();
    });

    const interval = window.setInterval(checkForUpdate, 60 * 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("focus", checkForUpdate);
      document.removeEventListener("visibilitychange", checkForUpdate);
      window.clearInterval(interval);
    };
  }, []);

  return { updateAvailable, applyUpdate };
}
