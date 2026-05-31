import { randomBytes } from "node:crypto";

/** 00000–99999, uniform. */
const ORDER_NUM_MAX = 100_000;
const ORDER_NUM_BYTE_CUTOFF = 65536 - (65536 % ORDER_NUM_MAX);

function randomFiveDigitSuffix(): string {
  while (true) {
    const b = randomBytes(2);
    const val = b[0]! * 256 + b[1]!;
    if (val < ORDER_NUM_BYTE_CUTOFF) {
      return String(val % ORDER_NUM_MAX).padStart(5, "0");
    }
  }
}

/** Short bakery-friendly id, e.g. CAKE-04217 */
export function generateOrderId(): string {
  return `CAKE-${randomFiveDigitSuffix()}`;
}
