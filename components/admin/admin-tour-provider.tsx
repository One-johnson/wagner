"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Joyride, STATUS, type EventData } from "react-joyride";
import { createAdminTourSteps } from "@/lib/admin/tour-steps";
import { tourJoyrideStyles, tourLocale, tourOptions } from "@/lib/admin/tour-styles";
import { TOUR_COMPLETED_KEY } from "@/lib/admin/tour-utils";

type AdminTourContextValue = {
  startTour: () => void;
  resetTour: () => void;
  isRunning: boolean;
};

const AdminTourContext = createContext<AdminTourContextValue | null>(null);

export function useAdminTour() {
  const ctx = useContext(AdminTourContext);
  if (!ctx) {
    throw new Error("useAdminTour must be used within AdminTourProvider");
  }
  return ctx;
}

export function AdminTourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigate = useCallback(
    (path: string) =>
      new Promise<void>((resolve) => {
        if (pathname === path) {
          resolve();
          return;
        }
        router.push(path);
        let attempts = 0;
        const id = window.setInterval(() => {
          attempts += 1;
          if (window.location.pathname === path || attempts > 100) {
            window.clearInterval(id);
            resolve();
          }
        }, 50);
      }),
    [router, pathname]
  );

  const steps = useMemo(() => createAdminTourSteps(navigate), [navigate]);

  const startTour = useCallback(() => {
    void navigate("/admin/dashboard").then(() => {
      window.setTimeout(() => setRun(true), 300);
    });
  }, [navigate]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    startTour();
  }, [startTour]);

  useEffect(() => {
    if (!mounted) return;
    if (localStorage.getItem(TOUR_COMPLETED_KEY)) return;
    const timer = window.setTimeout(() => startTour(), 1500);
    return () => window.clearTimeout(timer);
  }, [mounted, startTour]);

  return (
    <AdminTourContext.Provider
      value={{ startTour, resetTour, isRunning: run }}
    >
      {children}
      {mounted ? (
        <Joyride
          steps={steps}
          run={run}
          continuous
          scrollToFirstStep
          styles={tourJoyrideStyles}
          locale={tourLocale}
          options={tourOptions}
          onEvent={(data: EventData) => {
            if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
              setRun(false);
              localStorage.setItem(TOUR_COMPLETED_KEY, "1");
            }
          }}
        />
      ) : null}
    </AdminTourContext.Provider>
  );
}
