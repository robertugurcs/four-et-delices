import { isValidPhoneNumber } from "libphonenumber-js";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import { type Locale, isValidLocale } from "@/i18n/config";
import { formatPhoneForWhatsApp } from "@/lib/format-phone-e164";
import { getEarliestEventDate, isEventDateAllowed, parseIsoDate } from "@/lib/event-date";
import type { Occasion } from "@/lib/cake-inquiry-constants";

/** Resend needs Node.js — not the Edge runtime. */
export const runtime = "nodejs";

const NOTES_FALLBACK = "No additional notes provided.";
const GENERIC_ERROR = "We couldn't send your inquiry. Please try again.";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type InquiryInput = {
  locale?: unknown;
  occasion?: unknown;
  servings?: unknown;
  flavour?: unknown;
  customFlavour?: unknown;
  style?: unknown;
  notes?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  eventDate?: unknown;
  deliveryMethod?: unknown;
};

type Inquiry = {
  locale: Locale;
  occasion: string;
  peopleCount: string;
  flavour: string;
  designStyle: string;
  notes: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventDate: string;
  deliveryMethod: string;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * French labels for the English enum values submitted by the form.
 * Mirrors src/i18n/dictionaries/fr.ts -> inquiry.options.
 * Free-text values (e.g. a custom flavour) fall through unchanged.
 */
const FR_VALUE_LABELS = {
  occasions: {
    Wedding: "Mariage",
    Birthday: "Anniversaire",
    "Baby shower": "Baby shower",
    Graduation: "Remise de diplôme",
    "Corporate event": "Événement d'entreprise",
    "Something else": "Autre",
  },
  servings: {
    "15–18": "15–18",
    "19–24": "19–24",
    "25–30": "25–30",
    "31–35": "31–35",
    "36–40": "36–40",
    "41–50": "41–50",
    More: "Plus",
  },
  flavours: {
    Strawberry: "Fraise",
    "Mango compote": "Compote de mangue",
    "Passion fruit": "Fruit de la passion",
    "Chocolate & Vanilla": "Chocolat & vanille",
    "Kinder Bueno": "Kinder Bueno",
    "Ferrero Rocher": "Ferrero Rocher",
    Pistachio: "Pistache",
    "Other / Custom flavour": "Autre / saveur personnalisée",
  },
  styles: {
    "Minimal & elegant": "Minimal & élégant",
    "Floral & romantic": "Floral & romantique",
    "Modern & clean": "Moderne & épuré",
    "Luxurious & detailed": "Luxueux & détaillé",
    "Not sure yet": "Pas encore sûr(e)",
  },
  delivery: {
    Delivery: "Livraison",
    Pickup: "Retrait",
  },
} as const satisfies Record<string, Record<string, string>>;

type ValueCategory = keyof typeof FR_VALUE_LABELS;

/** English is the source enum, so `en` returns the value as-is. */
function localizeValue(
  category: ValueCategory,
  value: string,
  locale: Locale,
): string {
  if (locale !== "fr") return value;
  const map = FR_VALUE_LABELS[category] as Record<string, string>;
  return map[value] ?? value;
}

/** Order reference, e.g. FD-20260608-A1B2C */
function generateOrderReference(): string {
  const now = new Date();
  const datePart =
    `${now.getFullYear()}` +
    `${String(now.getMonth() + 1).padStart(2, "0")}` +
    `${String(now.getDate()).padStart(2, "0")}`;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(5);
  let random = "";
  for (let i = 0; i < 5; i += 1) {
    random += alphabet[bytes[i]! % alphabet.length];
  }
  return `FD-${datePart}-${random}`;
}

function readEnv() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const owner = process.env.OWNER_EMAIL?.trim();
  if (!apiKey || !from || !owner) {
    const missing = [
      !apiKey && "RESEND_API_KEY",
      !from && "RESEND_FROM_EMAIL",
      !owner && "OWNER_EMAIL",
    ].filter(Boolean);
    console.error(
      `[inquiry] Email env not configured. Missing: ${missing.join(", ")}`,
    );
    return null;
  }
  return { apiKey, from, owner };
}

function parseInquiry(body: InquiryInput): {
  inquiry?: Inquiry;
  missing?: string[];
} {
  const localeRaw = str(body.locale);
  const rawPhone = str(body.phone);
  const customerPhone = formatPhoneForWhatsApp(rawPhone) ?? rawPhone;

  const inquiry: Inquiry = {
    locale: isValidLocale(localeRaw) ? localeRaw : "en",
    occasion: str(body.occasion),
    peopleCount: str(body.servings),
    flavour: str(body.customFlavour) || str(body.flavour),
    designStyle: str(body.style),
    notes: str(body.notes) || NOTES_FALLBACK,
    customerName: str(body.name),
    customerPhone,
    customerEmail: str(body.email),
    eventDate: str(body.eventDate),
    deliveryMethod: str(body.deliveryMethod),
  };

  const missing: string[] = [];
  if (!inquiry.customerName) missing.push("customerName");
  if (!inquiry.customerEmail || !EMAIL_RE.test(inquiry.customerEmail)) {
    missing.push("customerEmail");
  }
  if (!inquiry.customerPhone || !isValidPhoneNumber(inquiry.customerPhone)) {
    missing.push("customerPhone");
  }
  if (!inquiry.occasion) missing.push("occasion");
  if (!inquiry.peopleCount) missing.push("peopleCount");
  if (!str(body.flavour)) missing.push("flavour");
  if (!inquiry.designStyle) missing.push("designStyle");
  if (!inquiry.eventDate) missing.push("eventDate");
  else {
    const parsedEventDate = parseIsoDate(inquiry.eventDate);
    const earliest = getEarliestEventDate(inquiry.occasion as Occasion);
    if (!parsedEventDate || !isEventDateAllowed(parsedEventDate, earliest)) {
      missing.push("eventDate");
    }
  }
  if (!inquiry.deliveryMethod) missing.push("deliveryMethod");

  if (missing.length > 0) return { missing };
  return { inquiry };
}

/** Owner / Khoudia inbox (OWNER_EMAIL) always receives French. */
function buildOwnerEmail(inquiry: Inquiry, orderReference: string) {
  const rows: [string, string][] = [
    ["Numéro de commande", orderReference],
    ["Nom du client", inquiry.customerName],
    ["Téléphone du client", inquiry.customerPhone],
    ["E-mail du client", inquiry.customerEmail],
    ["Occasion", localizeValue("occasions", inquiry.occasion, "fr")],
    ["Taille / nombre de personnes", localizeValue("servings", inquiry.peopleCount, "fr")],
    ["Saveur", localizeValue("flavours", inquiry.flavour, "fr")],
    ["Style", localizeValue("styles", inquiry.designStyle, "fr")],
    ["Date de l'événement", inquiry.eventDate],
    ["Livraison ou retrait", localizeValue("delivery", inquiry.deliveryMethod, "fr")],
    ["Notes", inquiry.notes],
  ];

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f7f4f0;font-family:Georgia,'Times New Roman',serif;color:#2a2420;">
  <div style="max-width:560px;margin:0 auto;padding:24px;background:#ffffff;">
    <h1 style="font-size:20px;margin:0 0 16px;color:#1a1a1a;">Nouvelle demande de gâteau reçue</h1>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:6px 12px 6px 0;color:#6b5c54;vertical-align:top;white-space:nowrap;">${escapeHtml(
              label,
            )}</td><td style="padding:6px 0;color:#1f1a16;white-space:pre-wrap;">${escapeHtml(
              value,
            )}</td></tr>`,
        )
        .join("\n      ")}
    </table>
  </div>
</body>
</html>`;

  return { text, html };
}

type CustomerEmailCopy = {
  subject: string;
  greeting: (name: string) => string;
  intro: string;
  rowLabels: {
    orderReference: string;
    occasion: string;
    cakeSize: string;
    flavour: string;
    designStyle: string;
    eventDate: string;
    notes: string;
  };
  deliveryConfirmation: (delivery: string) => string;
  inspiration: string;
  closingLine: string;
  signature: string[];
};

const CUSTOMER_EMAIL_COPY: Record<Locale, CustomerEmailCopy> = {
  en: {
    subject: "Your cake inquiry has been received",
    greeting: (name) => `Hello ${name},`,
    intro:
      "Thank you for choosing Four et Délices for your celebration! Cake Designer Khoudia here. I have personally received your cake inquiry.",
    rowLabels: {
      orderReference: "Order reference",
      occasion: "Occasion",
      cakeSize: "Cake size",
      flavour: "Flavour",
      designStyle: "Design style",
      eventDate: "Event date",
      notes: "Your notes",
    },
    deliveryConfirmation: (delivery) =>
      `You have confirmed that you will receive your order by ${delivery}.`,
    inspiration:
      "Inspiration photos? Reply here or email with your order reference.",
    closingLine:
      "I will reach out soon to confirm the details. Thank you for trusting Four et Délices.",
    signature: ["With care,", "Cake Designer Khoudia", "Four et Délices"],
  },
  fr: {
    subject: "Votre demande de gâteau a bien été reçue",
    greeting: (name) => `Bonjour ${name},`,
    intro:
      "Merci d'avoir choisi Four et Délices pour votre célébration ! Ici Khoudia, designer de gâteaux. J'ai bien reçu votre demande.",
    rowLabels: {
      orderReference: "Numéro de commande",
      occasion: "Occasion",
      cakeSize: "Taille",
      flavour: "Saveur",
      designStyle: "Style",
      eventDate: "Date",
      notes: "Vos notes",
    },
    deliveryConfirmation: (delivery) =>
      `Vous avez confirmé ${delivery} pour votre commande.`,
    inspiration:
      "Photo d'inspiration ? Répondez ici ou par e-mail avec votre numéro de commande.",
    closingLine:
      "Je vous contacterai bientôt. Merci de votre confiance envers Four et Délices.",
    signature: ["Avec attention,", "Khoudia, designer de gâteaux", "Four et Délices"],
  },
};

function formatDeliveryForEmail(deliveryMethod: string, locale: Locale): string {
  if (locale === "fr") {
    return deliveryMethod === "Delivery" ? "la livraison" : "le retrait";
  }
  return deliveryMethod;
}

function buildCustomerEmail(inquiry: Inquiry, orderReference: string) {
  const copy = CUSTOMER_EMAIL_COPY[inquiry.locale];
  const delivery = formatDeliveryForEmail(inquiry.deliveryMethod, inquiry.locale);
  const occasion = localizeValue("occasions", inquiry.occasion, inquiry.locale);
  const cakeSize = localizeValue("servings", inquiry.peopleCount, inquiry.locale);
  const flavour = localizeValue("flavours", inquiry.flavour, inquiry.locale);
  const designStyle = localizeValue("styles", inquiry.designStyle, inquiry.locale);

  const text = `${copy.greeting(inquiry.customerName)}

${copy.intro}

${copy.rowLabels.orderReference}: ${orderReference}
${copy.rowLabels.occasion}: ${occasion}
${copy.rowLabels.cakeSize}: ${cakeSize}
${copy.rowLabels.flavour}: ${flavour}
${copy.rowLabels.designStyle}: ${designStyle}
${copy.rowLabels.eventDate}: ${inquiry.eventDate}
${copy.rowLabels.notes}: ${inquiry.notes}
${copy.deliveryConfirmation(delivery)}

${copy.inspiration}

${copy.closingLine}

${copy.signature.join("\n")}`;

  const rows: [string, string][] = [
    [copy.rowLabels.orderReference, orderReference],
    [copy.rowLabels.occasion, occasion],
    [copy.rowLabels.cakeSize, cakeSize],
    [copy.rowLabels.flavour, flavour],
    [copy.rowLabels.designStyle, designStyle],
    [copy.rowLabels.eventDate, inquiry.eventDate],
    [copy.rowLabels.notes, inquiry.notes],
  ];

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:32px 24px;background:#faf8f5;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#2a2420;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;background:#ffffff;">
    <p style="font-size:18px;margin:0 0 20px;">${escapeHtml(copy.greeting(inquiry.customerName))}</p>
    <p style="margin:0 0 20px;">${escapeHtml(copy.intro)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:15px;border-top:1px solid #e8e2dc;">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:8px 12px 8px 0;color:#6b5c54;vertical-align:top;white-space:nowrap;border-bottom:1px solid #e8e2dc;">${escapeHtml(
              label,
            )}</td><td style="padding:8px 0;color:#1f1a16;white-space:pre-wrap;border-bottom:1px solid #e8e2dc;">${escapeHtml(
              value,
            )}</td></tr>`,
        )
        .join("\n      ")}
    </table>
    <p style="margin:20px 0 0;">${escapeHtml(copy.deliveryConfirmation(delivery))}</p>
    <p style="margin:20px 0 0;">${escapeHtml(copy.inspiration)}</p>
    <p style="margin:20px 0 0;">${escapeHtml(copy.closingLine)}</p>
    <p style="margin:24px 0 0;font-style:italic;color:#3d3530;">${copy.signature
      .map((line) => escapeHtml(line))
      .join("<br/>")}</p>
  </div>
</body>
</html>`;

  return { subject: copy.subject, text, html };
}

export async function POST(request: Request) {
  const env = readEnv();
  if (!env) {
    return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 500 });
  }

  let body: InquiryInput;
  try {
    body = (await request.json()) as InquiryInput;
  } catch {
    return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 400 });
  }

  const { inquiry, missing } = parseInquiry(body);
  if (!inquiry) {
    console.error(`[inquiry] Invalid submission. Missing/invalid: ${missing?.join(", ")}`);
    return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 400 });
  }

  const orderReference = generateOrderReference();
  const resend = new Resend(env.apiKey);

  const owner = buildOwnerEmail(inquiry, orderReference);
  const ownerResult = await resend.emails.send({
    from: env.from,
    to: env.owner,
    replyTo: inquiry.customerEmail,
    subject: `Nouvelle demande de gâteau reçue — ${orderReference}`,
    text: owner.text,
    html: owner.html,
  });

  if (ownerResult.error) {
    console.error("[inquiry] Owner email failed:", ownerResult.error.message);
    return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 502 });
  }

  const customer = buildCustomerEmail(inquiry, orderReference);
  const customerResult = await resend.emails.send({
    from: env.from,
    to: inquiry.customerEmail,
    replyTo: env.owner,
    subject: `${customer.subject} — ${orderReference}`,
    text: customer.text,
    html: customer.html,
  });

  if (customerResult.error) {
    console.error(
      "[inquiry] Customer confirmation email failed (owner email already sent):",
      customerResult.error.message,
    );
  }

  return NextResponse.json({ success: true, orderReference });
}
