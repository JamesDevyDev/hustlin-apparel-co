export const STORAGE_KEYS = {
  cart: "fibonacci:cart",
  products: "fibonacci:products",
  orders: "fibonacci:orders",
  settings: "fibonacci:settings",
  featured: "fibonacci:featured",
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Returns false when the write failed (storage full or blocked). */
export function writeStorage<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Storage can be full or blocked; the cart still works for this session.
    return false;
  }
}
