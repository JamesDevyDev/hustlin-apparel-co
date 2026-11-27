"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductById } from "@/lib/services/product-service";
import type { Product } from "@/types/product";
import { ProductForm } from "./product-form";

export function EditProduct({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    getProductById(id).then(setProduct);
  }, [id]);

  if (product === undefined) return <p className="text-sm" aria-busy="true">Loading…</p>;

  if (product === null) {
    return (
      <p className="text-sm">
        Product not found.{" "}
        <Link href="/admin" className="underline underline-offset-4">Back to products</Link>
      </p>
    );
  }

  return <ProductForm product={product} />;
}
