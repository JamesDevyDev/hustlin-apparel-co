"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/mock-storage";
import type { CartLine } from "@/types/cart";
import type { Product } from "@/types/product";

const MAX_QUANTITY = 99;

interface CartContextValue {
  items: CartLine[];
  /** Total number of units in the cart */
  count: number;
  subtotal: number;
  /** False until the saved cart has been read from localStorage */
  ready: boolean;
  addItem: (
    product: Product,
    options: Record<string, string>,
    quantity: number,
  ) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function lineId(productId: string, options: Record<string, string>): string {
  const key = Object.keys(options)
    .sort()
    .map((k) => `${k}=${options[k]}`)
    .join("|");
  return `${productId}::${key}`;
}

const clamp = (n: number) => Math.min(MAX_QUANTITY, Math.max(1, n));

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // Load the saved cart after mount (keeps server and client markup identical).
  useEffect(() => {
    setItems(readStorage<CartLine[]>(STORAGE_KEYS.cart, []));
    setReady(true);
  }, []);

  // Persist every change once the saved cart has been loaded.
  useEffect(() => {
    if (ready) writeStorage(STORAGE_KEYS.cart, items);
  }, [items, ready]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.cart) {
        setItems(readStorage<CartLine[]>(STORAGE_KEYS.cart, []));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback<CartContextValue["addItem"]>(
    (product, options, quantity) => {
      const id = lineId(product.id, options);
      setItems((prev) => {
        const size = options["Size"] ?? options["size"] ?? "";
        const available = product.stockBySize?.[size] ?? product.stockBySize?.[""] ?? product.stock;
        const inCart = prev.filter((l) => l.productId === product.id && (l.options["Size"] ?? l.options["size"] ?? "") === size).reduce((n, l) => n + l.quantity, 0);
        const room = Math.min(MAX_QUANTITY, available) - inCart;
        const toAdd = Math.min(quantity, room);
        if (toAdd < 1) return prev;

        const existing = prev.find((l) => l.id === id);
        if (existing) {
          return prev.map((l) =>
            l.id === id ? { ...l, quantity: clamp(l.quantity + toAdd) } : l,
          );
        }
        return [
          ...prev,
          {
            id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.images[0],
            options,
            quantity: clamp(toAdd),
          },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity < 1
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, quantity: clamp(quantity) } : l)),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.reduce((n, l) => n + l.quantity, 0),
      subtotal: items.reduce((sum, l) => sum + l.price * l.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [items, ready, addItem, updateQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
