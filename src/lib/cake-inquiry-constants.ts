export const OCCASIONS = [
  "Wedding",
  "Birthday",
  "Baby shower",
  "Graduation",
  "Corporate event",
  "Something else",
] as const;

export const SERVINGS = [
  "15–18",
  "19–24",
  "25–30",
  "31–35",
  "36–40",
  "41–50",
  "More",
] as const;

export const FLAVOURS = [
  "Strawberry",
  "Mango compote",
  "Passion fruit",
  "Chocolate & Vanilla",
  "Kinder Bueno",
  "Ferrero Rocher",
  "Pistachio",
  "Other / Custom flavour",
] as const;

export const CUSTOM_FLAVOUR_OPTION = "Other / Custom flavour" as const;

export function formatFlavourForDisplay(
  flavour: Flavour,
  customFlavour: string | null | undefined,
): string {
  if (flavour !== CUSTOM_FLAVOUR_OPTION) return flavour;
  const custom = customFlavour?.trim();
  return custom ? `${flavour} — ${custom}` : flavour;
}

export const STYLES = [
  "Minimal & elegant",
  "Floral & romantic",
  "Modern & clean",
  "Luxurious & detailed",
  "Not sure yet",
] as const;

export const DELIVERY_METHODS = ["Delivery", "Pickup"] as const;

export type Occasion = (typeof OCCASIONS)[number];
export type Servings = (typeof SERVINGS)[number];
export type Flavour = (typeof FLAVOURS)[number];
export type Style = (typeof STYLES)[number];
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];
