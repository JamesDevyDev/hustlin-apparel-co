export interface ProductOption {
  /** e.g. "Size" */
  name: string;
  values: string[];
}

export interface SizeChart {
  columns: string[];
  rows: { label: string; values: string[] }[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Price in whole pesos */
  price: number;
  /** Category slug */
  category: string;
  features: string[];
  images: string[];
  options: ProductOption[];
  sizeChart?: SizeChart;
  /** Inventory by size/variant value, e.g. { S: 3, M: 5, L: 6 }. */
  stockBySize?: Record<string, number>;
  /** Total units on hand, derived from stockBySize. */
  stock: number;
  available: boolean;
  featured: boolean;
  createdAt: string;
}
