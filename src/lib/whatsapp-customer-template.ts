import type { Locale } from "@/i18n/config";
import {
  formatFlavourForDisplay,
  type DeliveryMethod,
} from "@/lib/cake-inquiry-constants";
import type { CakeInquiryPayload } from "@/types/cake-inquiry";

/** Meta template names — must match WhatsApp Manager exactly. */
export const CUSTOMER_WHATSAPP_TEMPLATES = {
  en: {
    name: "customer_cake_confirmation",
    languageCode: "en",
  },
  fr: {
    name: "customer_cake_confirmation_fr",
    languageCode: "fr",
  },
} as const satisfies Record<
  Locale,
  { name: string; languageCode: string }
>;

/**
 * Copy-paste bodies for Meta WhatsApp Manager (Utility category, 9 body variables).
 * Meta body limit: 550 characters. Keep in sync with the approved template.
 */
export const META_CUSTOMER_TEMPLATE_BODIES = {
  en: `Hello {{1}},

Thank you for choosing Four et Délices for your celebration! Cake Designer Khoudia here. I have personally received your cake inquiry.

Order reference: {{2}}
Occasion: {{3}}
Cake size: {{4}}
Flavour: {{5}}
Design style: {{6}}
Event date: {{7}}
Your notes: {{8}}
You have confirmed that you will receive your order by {{9}}.

Inspiration photos? Reply here or email with your order reference.

I will reach out soon to confirm the details. Thank you for trusting Four et Délices.

With care,
Cake Designer Khoudia
Four et Délices`,
  fr: `Bonjour {{1}},

Merci d'avoir choisi Four et Délices pour votre célébration ! Ici Khoudia, designer de gâteaux. J'ai bien reçu votre demande.

Numéro de commande : {{2}}
Occasion : {{3}}
Taille : {{4}}
Saveur : {{5}}
Style : {{6}}
Date : {{7}}
Vos notes : {{8}}
Vous avez confirmé {{9}} pour votre commande.

Photo d'inspiration ? Répondez ici ou par e-mail avec votre numéro de commande.

Je vous contacterai bientôt. Merci de votre confiance envers Four et Délices.

Avec attention,
Khoudia, designer de gâteaux
Four et Délices`,
} as const satisfies Record<Locale, string>;

export function resolveCustomerWhatsAppTemplate(locale: Locale) {
  return CUSTOMER_WHATSAPP_TEMPLATES[locale];
}

/** Email and plain summary labels — Delivery / Pickup or Livraison / Retrait. */
export function formatDeliveryForCustomer(
  deliveryMethod: DeliveryMethod,
  locale: Locale,
): string {
  if (locale === "fr") {
    return deliveryMethod === "Delivery" ? "Livraison" : "Retrait";
  }
  return deliveryMethod;
}

/** WhatsApp {{9}} — fits the confirmation sentence in each locale template. */
export function formatDeliveryForWhatsApp(
  deliveryMethod: DeliveryMethod,
  locale: Locale,
): string {
  if (locale === "fr") {
    return deliveryMethod === "Delivery" ? "la livraison" : "le retrait";
  }
  return deliveryMethod;
}

export function formatNotesForWhatsApp(notes: string, locale: Locale): string {
  const trimmed = notes.trim();
  if (trimmed.length > 0) return trimmed;
  return locale === "fr" ? "Aucune note supplémentaire" : "No additional notes";
}

export function buildCustomerWhatsAppParameters(
  payload: CakeInquiryPayload,
  orderId: string,
  firstName: string,
): string[] {
  return [
    firstName, // {{1}}
    orderId, // {{2}}
    payload.occasion, // {{3}}
    payload.servings, // {{4}}
    formatFlavourForDisplay(payload.flavour, payload.customFlavour), // {{5}}
    payload.style, // {{6}}
    payload.eventDate, // {{7}}
    formatNotesForWhatsApp(payload.notes, payload.locale), // {{8}}
    formatDeliveryForWhatsApp(payload.deliveryMethod, payload.locale), // {{9}}
  ];
}
