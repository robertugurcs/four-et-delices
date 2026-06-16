/**
 * Resend send diagnostic — sends ONE real test email to OWNER_EMAIL and prints
 * the actual Resend response (message id) or the real error (domain not
 * verified, invalid API key, etc.).
 *
 * Usage: node scripts/order/test-resend.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

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

const fromFile = loadEnvLocal();
const apiKey = (process.env.RESEND_API_KEY ?? fromFile.RESEND_API_KEY ?? "").trim();
const from = (process.env.RESEND_FROM ?? fromFile.RESEND_FROM ?? "").trim();
const owner = (process.env.OWNER_EMAIL ?? fromFile.OWNER_EMAIL ?? "").trim();

console.log("\nResend send diagnostic\n");

const missing = [];
if (!apiKey) missing.push("RESEND_API_KEY");
if (!from) missing.push("RESEND_FROM");
if (!owner) missing.push("OWNER_EMAIL");
if (missing.length > 0) {
  console.log(`  ✗ Missing env: ${missing.join(", ")}`);
  console.log("  Fill .env.local and retry.\n");
  process.exit(1);
}

console.log(`  From:  ${from}`);
console.log(`  To:    ${owner}`);
console.log(`  Key:   ${apiKey.slice(0, 6)}…\n`);

const { Resend } = await import("resend");
const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from,
  to: owner,
  subject: "Resend diagnostic — Four et Délices",
  text: "This is a Resend connectivity test from scripts/order/test-resend.mjs.",
  html: "<p>This is a Resend connectivity test from <code>scripts/order/test-resend.mjs</code>.</p>",
});

if (error) {
  console.log("  ✗ Resend returned an error:\n");
  console.log(`    name:    ${error.name ?? "(none)"}`);
  console.log(`    message: ${error.message ?? "(none)"}`);
  console.log("\n  Common causes:");
  console.log("    - 'The from domain is not verified' → verify RESEND_FROM domain in resend.com/domains");
  console.log("    - 'API key is invalid' → create a new key in resend.com/api-keys");
  console.log("    - sandbox (onboarding@resend.dev) only delivers to your own Resend account email\n");
  process.exit(1);
}

console.log(`  ✓ Sent. messageId: ${data?.id ?? "(unknown)"}`);
console.log(`  Check the inbox of ${owner}.\n`);
