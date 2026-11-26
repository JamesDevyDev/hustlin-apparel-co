"use client";

import { useEffect, useState } from "react";
import {
  getProductBySlug,
  listProducts,
  listRelatedProducts,
} from "@/lib/services/product-service";
import type { Product } from "@/types/product";

/** Returns null while loading. */
export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    listProducts({ category }).then((list) => {
      if (!cancelled) setProducts(list);
    });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return products;
}

/** `undefined` while loading, `null` when not found. */
export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setProduct(undefined);
    getProductBySlug(slug).then((p) => {
      if (!cancelled) setProduct(p);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return product;
}

export function useRelatedProducts(product: Product | null | undefined) {
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    listRelatedProducts(product).then((list) => {
      if (!cancelled) setRelated(list);
    });
    return () => {
      cancelled = true;
    };
  }, [product]);

  return related;
}
