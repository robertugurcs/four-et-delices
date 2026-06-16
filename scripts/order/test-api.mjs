/**
 * Manual order API test — triggers the same flow as the inquiry form.
 *
 * Sends 2 Resend emails + 1 WhatsApp (background, after API returns).
 * Prereq: npm run dev + npm run check:order-env
 *
 * Usage: node scripts/order/test-api.mjs [baseUrl]
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const payloadPath = resolve(process.cwd(), "scripts/order/test-payload.json");
const payload = JSON.parse(readFileSync(payloadPath, "utf8"));

console.log("\nOrder API test\n");
console.log(`  POST ${baseUrl}/api/orders`);
console.log(`  Customer email: ${payload.email}`);
console.log(`  Customer phone: ${payload.phone}`);
console.log("\n  Expected after success:");
console.log("    1. OWNER_EMAIL inbox  → New Cake Inquiry");
console.log("    2. payload.email      → customer confirmation");
console.log("    3. payload.phone      → WhatsApp template");
console.log("  Check dev terminal for [cake-inquiry] logs.\n");

const res = await fetch(`${baseUrl}/api/orders`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(30_000),
});

const text = await res.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  json = text;
}

console.log(`→ HTTP ${res.status}\n`);
console.log(typeof json === "string" ? json : JSON.stringify(json, null, 2));
console.log("");

process.exit(res.ok ? 0 : 1);
