/**
 * Verifies customer WhatsApp payload shape (9 params, notes {{8}}, delivery {{9}}).
 * Does not call Meta or send messages.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const file = readFileSync(
  resolve(process.cwd(), "src/lib/whatsapp-customer-template.ts"),
  "utf8",
);

const checks = [
  {
    name: "EN template name",
    ok: file.includes('name: "customer_cake_confirmation"'),
  },
  {
    name: "FR template name",
    ok: file.includes('name: "customer_cake_confirmation_fr"'),
  },
  {
    name: "EN body has Cake Designer Khoudia",
    ok: file.includes("Cake Designer Khoudia"),
  },
  {
    name: "EN body has Your notes: {{8}}",
    ok: file.includes("Your notes: {{8}}"),
  },
  {
    name: "EN body has delivery confirmation {{9}}",
    ok: file.includes(
      "You have confirmed that you will receive your order by {{9}}.",
    ),
  },
  {
    name: "FR body has Vos notes : {{8}}",
    ok: file.includes("Vos notes : {{8}}"),
  },
  {
    name: "FR body has delivery confirmation {{9}}",
    ok: file.includes("Vous avez confirmé {{9}} pour votre commande."),
  },
  {
    name: "buildCustomerWhatsAppParameters returns 9 items",
    ok: (() => {
      const fn = file.match(
        /export function buildCustomerWhatsAppParameters[\s\S]*?return \[([\s\S]*?)\];/,
      );
      if (!fn) return false;
      const items = fn[1].split("// {{").length - 1;
      return items === 9;
    })(),
  },
  {
    name: "notes mapped to {{8}}",
    ok: file.includes("formatNotesForWhatsApp(payload.notes, payload.locale), // {{8}}"),
  },
  {
    name: "delivery mapped to {{9}}",
    ok: file.includes(
      "formatDeliveryForWhatsApp(payload.deliveryMethod, payload.locale), // {{9}}",
    ),
  },
];

console.log("\nWhatsApp template verification\n");
let failed = 0;
for (const c of checks) {
  console.log(`  ${c.ok ? "✓" : "✗"} ${c.name}`);
  if (!c.ok) failed++;
}

if (failed > 0) {
  console.log(`\n${failed} check(s) failed.\n`);
  process.exit(1);
}

console.log(
  "\nAll checks passed. Submit Meta templates from docs/META_AND_PRODUCTION_SETUP.md\n",
);
