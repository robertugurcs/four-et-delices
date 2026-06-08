import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { Resend } from "resend";

/** Resend needs Node.js — not the Edge runtime. */
export const runtime = "nodejs";

const NOTES_FALLBACK = "No additional notes provided.";
const GENERIC_ERROR = "We couldn't send your inquiry. Please try again.";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type InquiryInput = {
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
  const inquiry: Inquiry = {
    occasion: str(body.occasion),
    peopleCount: str(body.servings),
    flavour: str(body.customFlavour) || str(body.flavour),
    designStyle: str(body.style),
    notes: str(body.notes) || NOTES_FALLBACK,
    customerName: str(body.name),
    customerPhone: str(body.phone),
    customerEmail: str(body.email),
    eventDate: str(body.eventDate),
    deliveryMethod: str(body.deliveryMethod),
  };

  const missing: string[] = [];
  if (!inquiry.customerName) missing.push("customerName");
  if (!inquiry.customerEmail || !EMAIL_RE.test(inquiry.customerEmail)) {
    missing.push("customerEmail");
  }
  if (!inquiry.customerPhone) missing.push("customerPhone");
  if (!inquiry.occasion) missing.push("occasion");
  if (!inquiry.peopleCount) missing.push("peopleCount");
  if (!str(body.flavour)) missing.push("flavour");
  if (!inquiry.designStyle) missing.push("designStyle");
  if (!inquiry.eventDate) missing.push("eventDate");
  if (!inquiry.deliveryMethod) missing.push("deliveryMethod");

  if (missing.length > 0) return { missing };
  return { inquiry };
}

function buildOwnerEmail(inquiry: Inquiry, orderReference: string) {
  const rows: [string, string][] = [
    ["Order reference", orderReference],
    ["Customer name", inquiry.customerName],
    ["Customer phone", inquiry.customerPhone],
    ["Customer email", inquiry.customerEmail],
    ["Occasion", inquiry.occasion],
    ["Cake size / people count", inquiry.peopleCount],
    ["Flavour", inquiry.flavour],
    ["Design style", inquiry.designStyle],
    ["Event date", inquiry.eventDate],
    ["Delivery or pickup", inquiry.deliveryMethod],
    ["Notes", inquiry.notes],
  ];

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f7f4f0;font-family:Georgia,'Times New Roman',serif;color:#2a2420;">
  <div style="max-width:560px;margin:0 auto;padding:24px;background:#ffffff;">
    <h1 style="font-size:20px;margin:0 0 16px;color:#1a1a1a;">New Cake Inquiry Received</h1>
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

function buildCustomerEmail(inquiry: Inquiry, orderReference: string) {
  const text = `Hello ${inquiry.customerName},

Thank you for choosing Four et Délices for your celebration! Cake Designer Khoudia here. I have personally received your cake inquiry.

Order reference: ${orderReference}
Occasion: ${inquiry.occasion}
Cake size: ${inquiry.peopleCount}
Flavour: ${inquiry.flavour}
Design style: ${inquiry.designStyle}
Event date: ${inquiry.eventDate}
Your notes: ${inquiry.notes}
You have confirmed that you will receive your order by ${inquiry.deliveryMethod}.

Inspiration photos? Reply here or email with your order reference.

I will reach out soon to confirm the details. Thank you for trusting Four et Délices.

With care,
Cake Designer Khoudia
Four et Délices`;

  const rows: [string, string][] = [
    ["Order reference", orderReference],
    ["Occasion", inquiry.occasion],
    ["Cake size", inquiry.peopleCount],
    ["Flavour", inquiry.flavour],
    ["Design style", inquiry.designStyle],
    ["Event date", inquiry.eventDate],
    ["Your notes", inquiry.notes],
  ];

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:32px 24px;background:#faf8f5;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#2a2420;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;background:#ffffff;">
    <p style="font-size:18px;margin:0 0 20px;">Hello ${escapeHtml(inquiry.customerName)},</p>
    <p style="margin:0 0 20px;">Thank you for choosing Four et Délices for your celebration! Cake Designer Khoudia here. I have personally received your cake inquiry.</p>
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
    <p style="margin:20px 0 0;">You have confirmed that you will receive your order by ${escapeHtml(
      inquiry.deliveryMethod,
    )}.</p>
    <p style="margin:20px 0 0;">Inspiration photos? Reply here or email with your order reference.</p>
    <p style="margin:20px 0 0;">I will reach out soon to confirm the details. Thank you for trusting Four et Délices.</p>
    <p style="margin:24px 0 0;font-style:italic;color:#3d3530;">With care,<br/>Cake Designer Khoudia<br/>Four et Délices</p>
  </div>
</body>
</html>`;

  return { text, html };
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
    subject: `New Cake Inquiry Received — ${orderReference}`,
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
    subject: `Your cake inquiry has been received — ${orderReference}`,
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
