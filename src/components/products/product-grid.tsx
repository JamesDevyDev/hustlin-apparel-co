"use client";

import { useProducts } from "@/hooks/use-products";
import { ProductImage } from "@/components/ui/product-image";
import { ProductCard } from "./product-card";
import type { Product } from "@/types/product";

const gridClass =
  "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-[30px] sm:gap-y-[44px] md:grid-cols-3";

export function ProductGrid({ category }: { category?: string }) {
  const products = useProducts(category);

  if (products === null) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: 6 }, (_, i) => (
          <ProductImage key={i} alt="" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="text-center text-sm">No products in this category yet.</p>;
  }

  return <ProductList products={products} />;
}

export function ProductList({ products }: { products: Product[] }) {
  return (
    <div className={gridClass}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
