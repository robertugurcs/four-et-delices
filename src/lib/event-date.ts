import type { Occasion } from "@/lib/cake-inquiry-constants";

export function toIsoDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  const date = new Date(y, m, d);

  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m ||
    date.getDate() !== d
  ) {
    return null;
  }

  return date;
}

export const STANDARD_LEAD_DAYS = 2;
export const PREMIUM_LEAD_DAYS = 7;

const PREMIUM_LEAD_OCCASIONS: readonly Occasion[] = [
  "Wedding",
  "Corporate event",
];

export function isPremiumLeadOccasion(occasion: Occasion | ""): boolean {
  return PREMIUM_LEAD_OCCASIONS.includes(occasion as Occasion);
}

export function getLeadDaysForOccasion(occasion: Occasion | ""): number {
  return isPremiumLeadOccasion(occasion)
    ? PREMIUM_LEAD_DAYS
    : STANDARD_LEAD_DAYS;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

export function getEarliestEventDate(
  occasion: Occasion | "",
  today: Date = startOfDay(new Date()),
): Date {
  return addDays(today, getLeadDaysForOccasion(occasion));
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isEventDateAllowed(
  date: Date,
  minDate: Date = startOfDay(new Date()),
): boolean {
  return !isBeforeDay(date, minDate);
}

export function getTodayIso(): string {
  return toIsoDateLocal(new Date());
}

export function getMonthMatrix(viewMonth: Date): (Date | null)[][] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = Array.from({ length: startOffset }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}
