/**
 * CLI seed helper — requires SEED_SECRET and NEXT_PUBLIC_CONVEX_URL in .env.local
 *
 * Usage: npm run seed -- admin@example.com password "Admin Name"
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
const secret = process.env.SEED_SECRET;

if (!url || !secret) {
  console.error("Set NEXT_PUBLIC_CONVEX_URL and SEED_SECRET in .env.local");
  process.exit(1);
}

const [adminEmail, adminPassword, adminName] = process.argv.slice(2);
if (!adminEmail || !adminPassword || !adminName) {
  console.error('Usage: npm run seed -- <email> <password> "Full Name"');
  process.exit(1);
}

const client = new ConvexHttpClient(url);

async function main() {
  const { api } = await import("../convex/_generated/api.js");
  const result = await client.mutation(api.seed.bootstrap, {
    secret,
    adminEmail,
    adminPassword,
    adminName,
  });
  console.log("Seeded:", result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
