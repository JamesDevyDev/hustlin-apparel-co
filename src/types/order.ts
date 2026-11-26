import type { CartLine } from "./cart";

export type OrderStatus = "pending" | "verified" | "rejected";

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
}

export interface Order {
  /** Also the order number shown to the customer, e.g. HAC-4F7K2Q */
  id: string;
  createdAt: string;
  customer: OrderCustomer;
  /** Snapshot of the cart at the time of ordering */
  items: CartLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  /** Receipt screenshot/photo as a (compressed) data URL */
  receipt: string;
  status: OrderStatus;
  reviewedAt?: string;
}
