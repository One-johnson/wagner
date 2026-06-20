/**
 * Clears all inventory data (tools, technicians, categories, transactions).
 * Requires an admin session token from a logged-in browser session.
 *
 * Usage: npm run clear-inventory -- <sessionToken>
 */
import { ConvexHttpClient } from "convex/browser";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const sessionToken = process.argv[2];

if (!url) {
  console.error("Set NEXT_PUBLIC_CONVEX_URL in .env.local");
  process.exit(1);
}

if (!sessionToken) {
  console.error(
    "Usage: npm run clear-inventory -- <sessionToken>\n" +
      "Copy your session token from browser cookies (wagner_session) while logged in."
  );
  process.exit(1);
}

const client = new ConvexHttpClient(url);

async function main() {
  const { api } = await import("../convex/_generated/api.js");
  const result = await client.mutation(api.inventory.clearAll, {
    sessionToken,
    confirm: "CLEAR_ALL_INVENTORY",
  });
  console.log("Inventory cleared:", result.deleted);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
