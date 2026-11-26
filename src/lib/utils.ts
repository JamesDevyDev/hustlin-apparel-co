export function formatPrice(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** A product can be bought when the admin has it on sale and units remain. */
export function isInStock(product: { available: boolean; stock: number }): boolean {
  return product.available && product.stock > 0;
}
