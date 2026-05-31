/**
 * Verifies order notification env vars for local test or production.
 * Usage: node scripts/check-order-env.mjs [--production]
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const isProduction = process.argv.includes("--production");

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

function mergeEnv(fromFile) {
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY ?? fromFile.RESEND_API_KEY,
    OWNER_EMAIL: process.env.OWNER_EMAIL ?? fromFile.OWNER_EMAIL,
    RESEND_FROM: process.env.RESEND_FROM ?? fromFile.RESEND_FROM,
    WHATSAPP_ACCESS_TOKEN:
      process.env.WHATSAPP_ACCESS_TOKEN ?? fromFile.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID:
      process.env.WHATSAPP_PHONE_NUMBER_ID ?? fromFile.WHATSAPP_PHONE_NUMBER_ID,
  };
}

const env = mergeEnv(loadEnvLocal());
const required = isProduction
  ? [
      "RESEND_API_KEY",
      "OWNER_EMAIL",
      "RESEND_FROM",
      "WHATSAPP_ACCESS_TOKEN",
      "WHATSAPP_PHONE_NUMBER_ID",
    ]
  : ["RESEND_API_KEY", "OWNER_EMAIL", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"];

const missing = required.filter((k) => !env[k]?.trim());
const mode = isProduction ? "production" : "local test";

console.log(`\nOrder env check (${mode})\n`);

for (const key of required) {
  const val = env[key]?.trim();
  const ok = Boolean(val);
  const display =
    key.includes("TOKEN") || key.includes("KEY")
      ? ok
        ? `${val.slice(0, 8)}…`
        : "(missing)"
      : val || "(missing)";
  console.log(`  ${ok ? "✓" : "✗"} ${key}: ${display}`);
}

if (missing.length > 0) {
  console.log(`\nMissing: ${missing.join(", ")}`);
  console.log("See docs/META_AND_PRODUCTION_SETUP.md and .env.example\n");
  process.exit(1);
}

if (!isProduction && env.OWNER_EMAIL?.includes("dakar.four.et.delices")) {
  console.log(
    "\nNote: Resend free tier may reject owner mail to dakar@… — use your Gmail for local test.\n",
  );
} else {
  console.log("\nAll required variables are set.\n");
}
