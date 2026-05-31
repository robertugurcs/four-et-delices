import { Resend } from "resend";
import { NextResponse } from "next/server";

import type { CakeInquiryPayload } from "@/types/cake-inquiry";
import {
  CUSTOM_FLAVOUR_OPTION,
  formatFlavourForDisplay,
} from "@/lib/cake-inquiry-constants";
import { defaultLocale, isValidLocale, type Locale } from "@/i18n/config";
import {
  CUSTOMER_EMAIL_COPY,
  OWNER_INSPIRATION_REMINDER,
} from "@/lib/inquiry-notification-copy";
import { generateOrderId } from "@/lib/generate-order-id";
import {
  buildCustomerWhatsAppParameters,
  formatDeliveryForCustomer,
  resolveCustomerWhatsAppTemplate,
} from "@/lib/whatsapp-customer-template";

const isDev = process.env.NODE_ENV === "development";

function buildPlainText(p: CakeInquiryPayload, orderId: string): string {
  const flavourDisplay = formatFlavourForDisplay(p.flavour, p.customFlavour);
  const contactBlock = [
    "Customer contact",
    "----------------",
    `Name: ${p.name}`,
    `Phone: ${p.phone}`,
    `Email: ${p.email}`,
  ].join("\n");

  const cakeBlock = [
    "Cake details",
    "------------",
    `Occasion: ${p.occasion}`,
    `Size (servings): ${p.servings}`,
    `Flavour: ${flavourDisplay}`,
    `Style: ${p.style}`,
    `Inspiration photo: ${OWNER_INSPIRATION_REMINDER[p.locale]}`,
  ].join("\n");

  const eventBlock = [
    "Event details",
    "-------------",
    `Event date: ${p.eventDate}`,
    `How they get the cake: ${p.deliveryMethod}`,
  ].join("\n");

  const notesText = p.notes.trim();
  const notesBlock = [
    "Notes from the customer",
    "-----------------------",
    notesText || "No extra notes.",
  ].join("\n");

  const reminder =
    "Reminder: Reply to this email or contact the customer by phone.";

  return [
    `Order ID: ${orderId}`,
    "",
    "New Cake Inquiry",
    "=================",
    "",
    contactBlock,
    "",
    cakeBlock,
    "",
    eventBlock,
    "",
    notesBlock,
    "",
    reminder,
  ].join("\n");
}

function buildHtml(p: CakeInquiryPayload, orderId: string): string {
  const h = (s: string) => escapeHtml(s);
  const flavourDisplay = formatFlavourForDisplay(p.flavour, p.customFlavour);
  const notesText = p.notes.trim() ? h(p.notes.trim()) : "No extra notes.";
  const inspiration = h(OWNER_INSPIRATION_REMINDER[p.locale]);

  const style = {
    body:
      "margin:0;padding:0;background:#f7f4f0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.55;color:#2a2420;",
    wrap:
      "max-width:560px;margin:0 auto;padding:24px 20px 32px;background:#ffffff;border-radius:0;",
    orderId:
      "font-size:15px;font-weight:600;letter-spacing:0.04em;margin:0 0 20px 0;padding:0 0 16px 0;border-bottom:1px solid #e8e2dc;color:#2a2420;font-family:ui-monospace,'Cascadia Code',monospace;",
    h1: "font-size:22px;font-weight:600;margin:0 0 8px 0;letter-spacing:0.02em;color:#1a1a1a;border-bottom:2px solid #c9a9a0;padding-bottom:12px;",
    h2: "font-size:15px;font-weight:600;margin:24px 0 10px 0;text-transform:uppercase;letter-spacing:0.06em;color:#5c4a42;",
    row: "margin:6px 0 0 0;padding:0;font-size:16px;color:#2a2420;",
    label: "color:#5c4a42;font-size:14px;",
    noteBox:
      "margin:10px 0 0 0;padding:12px 14px;background:#faf8f5;border-left:3px solid #c9a9a0;border-radius:0 6px 6px 0;color:#2a2420;white-space:pre-wrap;word-wrap:break-word;",
    reminder:
      "margin:28px 0 0 0;padding:14px 16px;background:#f5f0eb;border-radius:8px;font-size:15px;line-height:1.5;color:#3d3530;border:1px solid #e5ddd6;",
  };

  return `<!DOCTYPE html>
<html>
<body style="${style.body}">
  <div style="${style.wrap}">
    <p style="${style.orderId}">Order ID: ${h(orderId)}</p>
    <h1 style="${style.h1}">New Cake Inquiry</h1>

    <h2 style="${style.h2}">Customer contact</h2>
    <p style="${style.row}"><span style="${style.label}">Name</span><br/>${h(p.name)}</p>
    <p style="${style.row}"><span style="${style.label}">Phone</span><br/>${h(p.phone)}</p>
    <p style="${style.row}"><span style="${style.label}">Email</span><br/><a href="mailto:${p.email}" style="color:#6b4423;">${h(p.email)}</a></p>

    <h2 style="${style.h2}">Cake details</h2>
    <p style="${style.row}"><span style="${style.label}">Occasion</span><br/>${h(p.occasion)}</p>
    <p style="${style.row}"><span style="${style.label}">Size (how many it should serve)</span><br/>${h(p.servings)}</p>
    <p style="${style.row}"><span style="${style.label}">Flavour</span><br/>${h(flavourDisplay)}</p>
    <p style="${style.row}"><span style="${style.label}">Style / look</span><br/>${h(p.style)}</p>
    <p style="${style.row}"><span style="${style.label}">Inspiration photo</span><br/>${inspiration}</p>

    <h2 style="${style.h2}">Event details</h2>
    <p style="${style.row}"><span style="${style.label}">Event date</span><br/>${h(p.eventDate)}</p>
    <p style="${style.row}"><span style="${style.label}">Delivery or pickup</span><br/>${h(p.deliveryMethod)}</p>

    <h2 style="${style.h2}">Notes from the customer</h2>
    <div style="${style.noteBox}">${notesText}</div>

    <p style="${style.reminder}"><strong>Reminder:</strong> Reply to this email or contact the customer by phone.</p>
  </div>
</body>
</html>`;
}

function buildCustomerPlainText(
  p: CakeInquiryPayload,
  orderId: string,
): string {
  const copy = CUSTOMER_EMAIL_COPY[p.locale];
  const flavourDisplay = formatFlavourForDisplay(p.flavour, p.customFlavour);
  const notesText = p.notes.trim() || copy.noNotes;
  const deliveryDisplay = formatDeliveryForCustomer(p.deliveryMethod, p.locale);
  return [
    `Order ID ${orderId}`,
    "",
    copy.lead,
    "",
    copy.sectionTitle,
    "",
    `${copy.labels.occasion}, ${p.occasion}`,
    `${copy.labels.size}, ${p.servings}`,
    `${copy.labels.flavour}, ${flavourDisplay}`,
    `${copy.labels.style}, ${p.style}`,
    `${copy.labels.eventDate}, ${p.eventDate}`,
    `${copy.labels.notes}, ${notesText}`,
    `${copy.labels.delivery}, ${deliveryDisplay}`,
    "",
    copy.inspirationReminder,
    "",
    copy.outro,
  ].join("\n");
}

function buildCustomerHtml(p: CakeInquiryPayload, orderId: string): string {
  const copy = CUSTOMER_EMAIL_COPY[p.locale];
  const h = (s: string) => escapeHtml(s);
  const flavourDisplay = formatFlavourForDisplay(p.flavour, p.customFlavour);
  const notesText = p.notes.trim() ? h(p.notes.trim()) : h(copy.noNotes);
  const deliveryDisplay = h(
    formatDeliveryForCustomer(p.deliveryMethod, p.locale),
  );
  const style = {
    body:
      "margin:0;padding:0;background:#faf8f5;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#2a2420;",
    wrap: "max-width:520px;margin:0 auto;padding:32px 24px 40px;background:#ffffff;border-radius:0;",
    orderId:
      "font-size:15px;font-weight:600;letter-spacing:0.04em;margin:0 0 20px 0;padding:0 0 16px 0;border-bottom:1px solid #e8e2dc;color:#2a2420;font-family:ui-monospace,'Cascadia Code',monospace;",
    lead: "font-size:18px;margin:0 0 24px 0;color:#2a2420;font-weight:500;",
    sectionTitle: "font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#8a7a72;margin:0 0 12px 0;",
    list: "margin:0;padding:0;list-style:none;border-top:1px solid #e8e2dc;",
    item: "border-bottom:1px solid #e8e2dc;padding:10px 0 10px 0;font-size:15px;margin:0;",
    key: "color:#6b5c54;font-size:13px;margin:0 0 4px 0;",
    val: "color:#1f1a16;margin:0;font-size:16px;",
    reminder:
      "margin:24px 0 0 0;padding:14px 16px;background:#f5f0eb;border-radius:8px;font-size:15px;line-height:1.5;color:#3d3530;border:1px solid #e5ddd6;",
    outro: "margin:28px 0 0 0;font-size:16px;color:#3d3530;font-style:italic;",
  };
  return `<!DOCTYPE html>
<html>
<body style="${style.body}">
  <div style="${style.wrap}">
    <p style="${style.orderId}">Order ID ${h(orderId)}</p>
    <p style="${style.lead}">${h(copy.lead)}</p>
    <p style="${style.sectionTitle}">${h(copy.sectionTitle)}</p>
    <ul style="${style.list}">
      <li style="${style.item}"><p style="${style.key}">${h(copy.labels.occasion)}</p><p style="${style.val}">${h(p.occasion)}</p></li>
      <li style="${style.item}"><p style="${style.key}">${h(copy.labels.size)}</p><p style="${style.val}">${h(p.servings)}</p></li>
      <li style="${style.item}"><p style="${style.key}">${h(copy.labels.flavour)}</p><p style="${style.val}">${h(flavourDisplay)}</p></li>
      <li style="${style.item}"><p style="${style.key}">${h(copy.labels.style)}</p><p style="${style.val}">${h(p.style)}</p></li>
      <li style="${style.item}"><p style="${style.key}">${h(copy.labels.eventDate)}</p><p style="${style.val}">${h(p.eventDate)}</p></li>
      <li style="${style.item}"><p style="${style.key}">${h(copy.labels.notes)}</p><p style="${style.val}">${notesText}</p></li>
      <li style="${style.item}"><p style="${style.key}">${h(copy.labels.delivery)}</p><p style="${style.val}">${deliveryDisplay}</p></li>
    </ul>
    <p style="${style.reminder}">${h(copy.inspirationReminder)}</p>
    <p style="${style.outro}">${h(copy.outro)}</p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Safe summary for dev logs: no API keys, tokens, or full request bodies. */
function logResendErrorDev(prefix: string, err: { message?: string; name?: string }) {
  console.error(`[cake-inquiry] ${prefix}`, {
    resendErrorName: err.name,
    resendErrorMessage: err.message,
  });
}

/* ============================================================
   WHATSAPP — customer confirmation from the studio business number
   ============================================================
   Message leaves from WHATSAPP_PHONE_NUMBER_ID (Meta test number in dev;
   Khoudia's verified business number in production). Owner learns about
   orders via email only. Failures are non-fatal after emails succeed.
   ============================================================ */

/** Strips non-digits and a leading "+", returns null if implausibly short. */
function normalizeWhatsAppPhone(raw: string): string | null {
  const cleaned = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  return cleaned.length >= 8 ? cleaned : null;
}

/** "Jane Doe" -> "Jane". Falls back to the full trimmed name. */
function firstNameOf(fullName: string): string {
  const trimmed = fullName.trim();
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

type WhatsAppEnv = {
  accessToken: string;
  phoneNumberId: string;
};

function readWhatsAppEnv(): WhatsAppEnv | null {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!accessToken || !phoneNumberId) {
    if (isDev) {
      const missing: string[] = [];
      if (!accessToken) missing.push("WHATSAPP_ACCESS_TOKEN");
      if (!phoneNumberId) missing.push("WHATSAPP_PHONE_NUMBER_ID");
      console.warn("[cake-inquiry] WhatsApp skipped: env not ready", { missing });
    }
    return null;
  }
  return { accessToken, phoneNumberId };
}

/** Generic template-sender. Logs only safe metadata; never tokens or full bodies. */
async function sendWhatsAppTemplate(opts: {
  env: WhatsAppEnv;
  to: string;
  templateName: string;
  parameters: string[];
  languageCode?: string;
  label: string;
}): Promise<void> {
  const { env, to, templateName, parameters, languageCode = "en", label } = opts;
  const url = `https://graph.facebook.com/v25.0/${env.phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: "body",
              parameters: parameters.map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    });

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      if (isDev) {
        console.error(`[cake-inquiry] ${label}: non-JSON response`, {
          httpStatus: res.status,
        });
      }
      return;
    }

    if (!res.ok) {
      const errObj =
        json &&
        typeof json === "object" &&
        "error" in json &&
        json.error &&
        typeof json.error === "object"
          ? (json.error as { message?: string; type?: string; code?: number })
          : undefined;
      if (isDev) {
        console.error(`[cake-inquiry] ${label} failed`, {
          httpStatus: res.status,
          errorType: errObj?.type,
          errorCode: errObj?.code,
          errorMessage: errObj?.message,
          template: templateName,
        });
      } else {
        console.warn(`[cake-inquiry] ${label} failed.`);
      }
      return;
    }

    if (isDev) {
      const root = json && typeof json === "object" ? json : null;
      const messages =
        root && "messages" in root && Array.isArray(root.messages)
          ? root.messages
          : undefined;
      const first = messages?.[0];
      const messageId =
        first &&
        typeof first === "object" &&
        "id" in first &&
        typeof first.id === "string"
          ? first.id
          : undefined;
      console.log(`[cake-inquiry] ${label} sent`, {
        template: templateName,
        messageId: messageId ?? "(not in response)",
      });
    }
  } catch (e) {
    if (isDev) {
      console.error(`[cake-inquiry] ${label}: request error`, {
        errorName: e instanceof Error ? e.name : undefined,
        errorMessage: e instanceof Error ? e.message : undefined,
      });
    }
  }
}

/** Sends customer_cake_confirmation to the customer's number from the form. */
async function sendCustomerWhatsAppConfirmation(
  payload: CakeInquiryPayload,
  orderId: string,
): Promise<void> {
  const env = readWhatsAppEnv();
  if (!env) return;

  const customerPhone = normalizeWhatsAppPhone(payload.phone);
  if (!customerPhone) {
    if (isDev) {
      console.warn(
        "[cake-inquiry] Customer WhatsApp skipped: phone not parseable",
      );
    }
    return;
  }

  const template = resolveCustomerWhatsAppTemplate(payload.locale);

  const parameters = buildCustomerWhatsAppParameters(
    payload,
    orderId,
    firstNameOf(payload.name),
  );

  await sendWhatsAppTemplate({
    env,
    to: customerPhone,
    templateName: template.name,
    languageCode: template.languageCode,
    parameters,
    label: "WhatsApp customer confirmation",
  });
}

export async function POST(request: Request) {
  const key = process.env.RESEND_API_KEY?.trim();
  const owner = process.env.OWNER_EMAIL?.trim();
  const from =
    process.env.RESEND_FROM?.trim() ??
    "Cake Inquiries <onboarding@resend.dev>";

  if (!key || !owner) {
    if (isDev) {
      const missing: string[] = [];
      if (!key) missing.push("RESEND_API_KEY");
      if (!owner) missing.push("OWNER_EMAIL");
      console.warn("[cake-inquiry] Email not sent: environment not ready", {
        hasResendApiKey: Boolean(key),
        hasOwnerEmail: Boolean(owner),
        missing,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Missing or empty environment variable(s): ${missing.join(", ")}.`,
          hint: "Set them in .env.local, then stop and run npm run dev again so Next.js reloads the env file.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Server email is not configured." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: isDev
          ? "Request body is not valid JSON. Send Content-Type: application/json with a JSON object."
          : "Invalid request body.",
      },
      { status: 400 },
    );
  }

  const p = body as Partial<CakeInquiryPayload>;
  const requiredChecks: { field: string; ok: boolean }[] = [
    { field: "name", ok: Boolean(p.name && String(p.name).trim()) },
    { field: "phone", ok: Boolean(p.phone && String(p.phone).trim()) },
    { field: "email", ok: Boolean(p.email && String(p.email).trim()) },
    { field: "eventDate", ok: Boolean(p.eventDate && String(p.eventDate).trim()) },
    { field: "occasion", ok: Boolean(p.occasion) },
    { field: "servings", ok: Boolean(p.servings) },
    { field: "flavour", ok: Boolean(p.flavour) },
    { field: "style", ok: Boolean(p.style) },
    { field: "deliveryMethod", ok: Boolean(p.deliveryMethod) },
  ];
  const missingRequired = requiredChecks
    .filter((c) => !c.ok)
    .map((c) => c.field);

  if (missingRequired.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: isDev
          ? `Missing or empty required field(s): ${missingRequired.join(", ")}.`
          : "Missing required order fields.",
      },
      { status: 400 },
    );
  }

  const customFlavourRaw =
    p.customFlavour == null ? null : String(p.customFlavour).trim();
  if (
    p.flavour === CUSTOM_FLAVOUR_OPTION &&
    (!customFlavourRaw || customFlavourRaw.length === 0)
  ) {
    return NextResponse.json(
      {
        success: false,
        error: isDev
          ? "Missing or empty required field: customFlavour."
          : "Missing required order fields.",
      },
      { status: 400 },
    );
  }

  const localeRaw = p.locale == null ? defaultLocale : String(p.locale);
  const locale: Locale = isValidLocale(localeRaw) ? localeRaw : defaultLocale;

  const payload: CakeInquiryPayload = {
    locale,
    name: String(p.name).trim(),
    phone: String(p.phone).trim(),
    email: String(p.email).trim(),
    eventDate: String(p.eventDate).trim(),
    occasion: p.occasion!,
    servings: p.servings!,
    flavour: p.flavour!,
    customFlavour:
      p.flavour === CUSTOM_FLAVOUR_OPTION ? customFlavourRaw : null,
    style: p.style!,
    deliveryMethod: p.deliveryMethod!,
    notes: p.notes ?? "",
  };

  const orderId = generateOrderId();

  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from,
    to: owner,
    replyTo: payload.email,
    subject: `New Cake Inquiry — ${payload.name}`,
    text: buildPlainText(payload, orderId),
    html: buildHtml(payload, orderId),
  });

  if (error) {
    logResendErrorDev("Resend: owner email failed", {
      name: (error as { name?: string }).name,
      message: (error as { message?: string }).message,
    });
    if (isDev) {
      const msg = (error as { message?: string }).message;
      return NextResponse.json(
        {
          success: false,
          error: msg
            ? `Email could not be sent (Resend): ${msg}`
            : "Email could not be sent. Check the server terminal for the Resend error name/message.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Could not send email." },
      { status: 500 },
    );
  }

  const {
    data: customerData,
    error: customerError,
  } = await resend.emails.send({
    from,
    to: payload.email,
    replyTo: owner,
    subject: CUSTOMER_EMAIL_COPY[payload.locale].subject,
    text: buildCustomerPlainText(payload, orderId),
    html: buildCustomerHtml(payload, orderId),
  });

  if (customerError) {
    logResendErrorDev(
      "Resend: customer confirmation failed (owner email was already sent)",
      {
        name: (customerError as { name?: string }).name,
        message: (customerError as { message?: string }).message,
      },
    );
    if (isDev) {
      const msg = (customerError as { message?: string }).message;
      return NextResponse.json(
        {
          success: false,
          error: msg
            ? `Confirmation email could not be sent (Resend): ${msg}`
            : "Confirmation email could not be sent. Check the server terminal for details.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Could not send confirmation email." },
      { status: 500 },
    );
  }

  if (isDev) {
    console.log("[cake-inquiry] Order emails sent successfully (development)", {
      orderId,
      ownerResendId: data?.id,
      customerResendId: customerData?.id,
      inquirer: payload.name,
      occasion: payload.occasion,
      eventDate: payload.eventDate,
    });
  }

  await sendCustomerWhatsAppConfirmation(payload, orderId);

  return NextResponse.json({ success: true });
}
