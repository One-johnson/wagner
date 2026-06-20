export function formatConvexErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  if (!(error instanceof Error)) return fallback;

  const { message } = error;
  const uncaught = message.match(
    /Uncaught Error:\s*([\s\S]+?)(?:\n\s+at |\n\[|$)/
  );
  if (uncaught?.[1]) return uncaught[1].trim();

  const serverError = message.match(
    /Server Error:\s*([\s\S]+?)(?:\n\s+at |\n\[|$)/
  );
  if (serverError?.[1]) return serverError[1].trim();

  return (
    message
      .replace(/^\[CONVEX[^\]]*\]\s*/g, "")
      .replace(/^\[Request ID:[^\]]*\]\s*/g, "")
      .trim() || fallback
  );
}
