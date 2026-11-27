/**
 * A cart line stores a snapshot of the product so the cart renders
 * without another lookup, and so it maps cleanly onto an order line later.
 */
export interface CartLine {
  id: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  options: Record<string, string>;
  quantity: number;
}
