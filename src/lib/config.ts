/** Flat delivery fee in pesos. Shown at checkout only when above 0. */
export const SHIPPING_FEE = 0;

/** Optional public payment QR image URL; can also be configured in Admin → Settings. */
export const PAYMENT_QR_SRC = process.env.NEXT_PUBLIC_PAYMENT_QR_SRC ?? "";
