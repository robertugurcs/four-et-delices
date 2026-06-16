/**
 * Order notifications env check (Resend × 2 emails + WhatsApp).
 * Usage: node scripts/order/check-env.mjs [--production]
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
    RESEND_FROM: process.env.RESEND_FROM ?? fromFile.RESEND_FROM,
    OWNER_EMAIL: process.env.OWNER_EMAIL ?? fromFile.OWNER_EMAIL,
    WHATSAPP_ACCESS_TOKEN:
      process.env.WHATSAPP_ACCESS_TOKEN ?? fromFile.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID:
      process.env.WHATSAPP_PHONE_NUMBER_ID ?? fromFile.WHATSAPP_PHONE_NUMBER_ID,
  };
}

const env = mergeEnv(loadEnvLocal());
const required = [
  "RESEND_API_KEY",
  "RESEND_FROM",
  "OWNER_EMAIL",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
];

const missing = required.filter((k) => !env[k]?.trim());
const mode = isProduction ? "production" : "local test";

console.log(`\nOrder notifications env (${mode})\n`);
console.log("  Flow: 2 Resend emails (owner + customer) + 1 WhatsApp\n");

for (const key of required) {
  const val = env[key]?.trim();
  const ok = Boolean(val);
  const display =
    key.includes("KEY") || key.includes("TOKEN")
      ? ok
        ? `${val.slice(0, 4)}…`
        : "(missing)"
      : val || "(missing)";
  console.log(`  ${ok ? "✓" : "✗"} ${key}: ${display}`);
}

if (missing.length > 0) {
  console.log(`\nMissing: ${missing.join(", ")}`);
  console.log("Copy .env.example → .env.local and fill values.\n");
  process.exit(1);
}

console.log("\nAll set. Restart npm run dev after editing .env.local.");
console.log("Test: form at /inquiry or npm run test:order-api\n");
