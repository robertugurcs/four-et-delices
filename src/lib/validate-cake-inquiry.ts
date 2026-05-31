import {
  CUSTOM_FLAVOUR_OPTION,
  type DeliveryMethod,
  DELIVERY_METHODS,
  type Flavour,
  FLAVOURS,
  type Occasion,
  OCCASIONS,
  type Servings,
  SERVINGS,
  type Style,
  STYLES,
} from "@/lib/cake-inquiry-constants";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { FieldErrors, CakeInquiryPayload } from "@/types/cake-inquiry";

export type CakeInquiryFormState = {
  occasion: Occasion | "";
  customOccasion: string;
  servings: Servings | "";
  customServings: string;
  flavour: Flavour | "";
  customFlavour: string;
  style: Style | "";
  notes: string;
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  deliveryMethod: DeliveryMethod | "";
};

type ValidationMessages = Dictionary["inquiry"]["validation"];

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function validateCakeInquiry(
  v: CakeInquiryFormState,
  messages: ValidationMessages,
): FieldErrors {
  const e: FieldErrors = {};

  if (!v.name.trim()) e.name = messages.name;
  if (!v.phone.trim()) e.phone = messages.phone;
  if (!v.email.trim()) e.email = messages.email;
  else if (!emailOk(v.email)) e.email = messages.emailInvalid;
  if (!v.eventDate) e.eventDate = messages.eventDate;
  if (!v.occasion) e.occasion = messages.occasion;
  else if (v.occasion === "Something else" && !v.customOccasion.trim()) {
    e.customOccasion = messages.customOccasion;
  }
  if (!v.servings) e.servings = messages.servings;
  else if (v.servings === "More" && !v.customServings.trim()) {
    e.customServings = messages.customServings;
  }
  if (!v.flavour) e.flavour = messages.flavour;
  else if (
    v.flavour === CUSTOM_FLAVOUR_OPTION &&
    !v.customFlavour.trim()
  ) {
    e.customFlavour = messages.customFlavour;
  }
  if (!v.style) e.style = messages.style;
  if (!v.deliveryMethod) e.deliveryMethod = messages.deliveryMethod;

  return e;
}

function isIn<T extends string>(value: string, list: readonly T[]): value is T {
  return (list as readonly string[]).includes(value);
}

export function toPayload(
  v: CakeInquiryFormState,
  locale: Locale,
): CakeInquiryPayload | null {
  if (
    !isIn(v.occasion, OCCASIONS) ||
    !isIn(v.servings, SERVINGS) ||
    !isIn(v.flavour, FLAVOURS) ||
    !isIn(v.style, STYLES) ||
    !isIn(v.deliveryMethod, DELIVERY_METHODS)
  ) {
    return null;
  }
  const noteLines: string[] = [];
  if (v.occasion === "Something else" && v.customOccasion.trim()) {
    noteLines.push(`Occasion detail: ${v.customOccasion.trim()}`);
  }
  if (v.servings === "More" && v.customServings.trim()) {
    noteLines.push(`Guest count: ${v.customServings.trim()}`);
  }
  const notesBody = v.notes.trim();
  const notes =
    noteLines.length > 0
      ? notesBody
        ? `${noteLines.join("\n")}\n\n${notesBody}`
        : noteLines.join("\n")
      : notesBody;

  return {
    locale,
    occasion: v.occasion,
    servings: v.servings,
    flavour: v.flavour,
    customFlavour:
      v.flavour === CUSTOM_FLAVOUR_OPTION ? v.customFlavour.trim() : null,
    style: v.style,
    notes,
    name: v.name.trim(),
    phone: v.phone.trim(),
    email: v.email.trim(),
    eventDate: v.eventDate,
    deliveryMethod: v.deliveryMethod,
  };
}
