import * as React from "react";

/** Phones and tablets in portrait — use card layouts instead of wide tables. */
const COMPACT_BREAKPOINT = 1024;
const QUERY = `(max-width: ${COMPACT_BREAKPOINT - 1}px)`;

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export function useIsCompact() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
