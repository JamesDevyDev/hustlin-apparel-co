"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  deleteProduct,
  listProducts,
} from "@/lib/services/product-service";
import { formatPrice, isInStock } from "@/lib/utils";
import type { Product } from "@/types/product";

export function AdminProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);

  const refresh = useCallback(async () => setProducts(await listProducts()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onDelete(p: Product) {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    await deleteProduct(p.id);
    refresh();
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-sm uppercase tracking-[0.18em]">Products</h1>
        <Link href="/admin/new" className="grid h-10 place-items-center bg-black px-6 text-xs uppercase tracking-[0.2em] text-white hover:bg-black/80">
          Add product
        </Link>
      </div>

      {products === null ? (
        <p className="text-sm" aria-busy="true">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm">No products yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black text-[11px] uppercase">
                <th className="py-3 pr-4 font-light">Name</th>
                <th className="py-3 pr-4 font-light">Category</th>
                <th className="py-3 pr-4 font-light">Price</th>
                <th className="py-3 pr-4 font-light">Stock</th>
                <th className="py-3 pr-4 font-light">Status</th>
                <th className="py-3 text-right font-light">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-black/15">
                  <td className="py-3 pr-4">
                    <Link href={`/shop/${p.slug}`} className="hover:underline">{p.name}</Link>
                    {p.featured && <span className="ml-2 text-[11px] text-black/50">Featured</span>}
                  </td>
                  <td className="py-3 pr-4 capitalize">{p.category}</td>
                  <td className="py-3 pr-4">{formatPrice(p.price)}</td>
                  <td className={`py-3 pr-4 ${p.stock <= 5 ? "text-red-600" : ""}`}>{p.stock}</td>
                  <td className="py-3 pr-4">
                    {!p.available ? "Hidden" : isInStock(p) ? "Available" : "Sold out"}
                  </td>
                  <td className="space-x-4 py-3 text-right">
                    <Link href={`/admin/${p.id}`} className="underline underline-offset-4">Edit</Link>
                    <button type="button" onClick={() => onDelete(p)} className="underline underline-offset-4">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
