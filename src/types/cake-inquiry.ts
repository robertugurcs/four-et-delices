import type { Locale } from "@/i18n/config";
import type {
  DeliveryMethod,
  Flavour,
  Occasion,
  Servings,
  Style,
} from "@/lib/cake-inquiry-constants";

export type CakeInquiryPayload = {
  locale: Locale;
  occasion: Occasion;
  servings: Servings;
  flavour: Flavour;
  customFlavour: string | null;
  style: Style;
  notes: string;
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  deliveryMethod: DeliveryMethod;
};

export type FieldErrors = Partial<
  Record<
    | keyof CakeInquiryPayload
    | "customFlavour"
    | "customOccasion"
    | "customServings",
    string
  >
>;
