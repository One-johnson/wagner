import { formatConvexErrorMessage } from "@/lib/convex/error-message";

const FRIENDLY_BY_EXACT: Record<string, string> = {
  "Invalid email or password":
    "That email or password doesn't look right. Please check both and try again.",
  "System already initialized":
    "This system is already set up. Sign in with your admin account instead.",
  "Enter a valid admin email": "Please enter a valid email address.",
  "Enter your full name": "Please enter your full name (at least 2 characters).",
  "Email already in use": "That email is already linked to another account.",
  "Current password is incorrect": "Your current password is incorrect.",
  "Password must be at least 8 characters":
    "Your password needs to be at least 8 characters long.",
  "Employee code already exists":
    "That employee ID is already taken. Close the form and open it again to get a new one.",
  "Employee code must be a 5-digit number":
    "Employee ID must be a 5-digit number. Close the form and open it again to get a new one.",
  "Could not generate employee code":
    "We couldn't generate an employee ID. Please close the form and try again.",
  "Technician not found": "We couldn't find that technician. They may have been removed.",
  "Tool not found": "We couldn't find that tool. It may have been removed.",
  "Asset tag already exists": "That asset tag is already in use. Choose a different one.",
  "Category already exists": "A category with that name already exists.",
  "Category name is required": "Please enter a category name.",
  "Cannot delete a checked-out tool. Record a return first.":
    "This tool is still checked out. Record a return before deleting it.",
  "Cannot delete a tool with an active checkout.":
    "This tool has an active checkout. Record a return before deleting it.",
  "Cannot delete a tool that has transaction history.":
    "This tool has history and can't be deleted.",
  "Cannot delete a technician with active checkouts.":
    "This technician still has tools checked out.",
  "Cannot delete a technician that has transaction history.":
    "This technician has history and can't be deleted.",
  "Unauthorized": "Your session has expired. Please sign in again.",
  "Forbidden": "You don't have permission to do that.",
};

const FRIENDLY_BY_PATTERN: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /not available/i,
    message: "That tool isn't available right now. Choose another one or record a return first.",
  },
  {
    pattern: /already checked out/i,
    message: "That tool is already checked out to someone else.",
  },
  {
    pattern: /inactive/i,
    message: "That technician isn't active. Choose another or reactivate them first.",
  },
  {
    pattern: /invalid seed secret/i,
    message: "Setup couldn't be completed. Please contact your administrator.",
  },
];

export type FriendlyErrorContext = "auth" | "setup" | "general";

const CONTEXT_FALLBACK: Record<FriendlyErrorContext, string> = {
  auth: "We couldn't sign you in. Check your email and password, then try again.",
  setup: "We couldn't finish setup. Review your details and try again.",
  general: "Something went wrong. Please try again.",
};

export function getFriendlyErrorMessage(
  error: unknown,
  context: FriendlyErrorContext = "general",
  fallback?: string
): string {
  const raw = formatConvexErrorMessage(error, "");
  if (!raw) return fallback ?? CONTEXT_FALLBACK[context];

  if (FRIENDLY_BY_EXACT[raw]) return FRIENDLY_BY_EXACT[raw];

  for (const { pattern, message } of FRIENDLY_BY_PATTERN) {
    if (pattern.test(raw)) return message;
  }

  if (/^Request ID:/i.test(raw) || /\[CONVEX/i.test(raw)) {
    return fallback ?? CONTEXT_FALLBACK[context];
  }

  return raw;
}

export function getFriendlyAuthErrorMessage(message: string): string {
  if (FRIENDLY_BY_EXACT[message]) return FRIENDLY_BY_EXACT[message];

  if (
    message.includes("Invalid email or password") ||
    message.includes("Uncaught Error: Invalid email or password")
  ) {
    return FRIENDLY_BY_EXACT["Invalid email or password"];
  }

  if (/Request ID|CONVEX|Server Error/i.test(message)) {
    return CONTEXT_FALLBACK.auth;
  }

  return message || CONTEXT_FALLBACK.auth;
}
