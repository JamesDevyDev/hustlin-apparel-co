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
  /** Units on hand. Deducted automatically when an order is placed. */
  stock: number;
  available: boolean;
  featured: boolean;
  createdAt: string;
}
