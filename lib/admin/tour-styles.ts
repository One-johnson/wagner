import type { Locale, PartialDeep, Styles } from "react-joyride";

export const tourLocale: Locale = {
  back: "Back",
  close: "Close",
  last: "Finish tour",
  next: "Next",
  nextWithProgress: "Next ({current} of {total})",
  open: "Open tour step",
  skip: "Skip tour",
};

export const tourJoyrideStyles: PartialDeep<Styles> = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  tooltip: {
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.18)",
  },
  tooltipTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 6,
  },
  tooltipContent: {
    fontSize: 13,
    lineHeight: 1.55,
    padding: "4px 0 0",
  },
  tooltipFooter: {
    marginTop: 14,
  },
  buttonPrimary: {
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    padding: "6px 14px",
  },
  buttonBack: {
    borderRadius: 8,
    fontSize: 13,
    marginRight: 6,
  },
  buttonSkip: {
    fontSize: 12,
    color: "var(--muted-foreground)",
  },
};

export const tourOptions = {
  primaryColor: "oklch(0.45 0.12 250)",
  textColor: "oklch(0.145 0 0)",
  backgroundColor: "oklch(1 0 0)",
  overlayColor: "rgba(0, 0, 0, 0.45)",
  overlayClickAction: false as const,
  zIndex: 10000,
  showProgress: true,
  skipBeacon: true,
  spotlightRadius: 10,
};
