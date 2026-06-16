import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Normalize to E.164 for WhatsApp / API (e.g. +221771234567 — no spaces).
 * Returns null when the value cannot be parsed as a valid number.
 */
export function formatPhoneE164(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;

  const parsed = parsePhoneNumberFromString(trimmed);
  if (!parsed?.isValid()) return null;

  return parsed.format("E.164");
}

/** Digits only with leading + — WhatsApp Cloud API `to` field format. */
export function formatPhoneForWhatsApp(phone: string): string | null {
  const e164 = formatPhoneE164(phone);
  if (!e164) return null;
  return e164.replace(/\s/g, "");
}
