import Link from "next/link";
import { formatPrice, isInStock } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ProductImage } from "@/components/ui/product-image";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block text-center">
      <ProductImage
        src={product.images[0]}
        alt={product.name}
        className="transition-opacity group-hover:opacity-80"
      />
      <h3 className="mt-5 text-[15px] font-light uppercase leading-tight">
        {product.name}
      </h3>
      <p className="mt-1 text-[13px] tracking-wider">
        {isInStock(product) ? (
          formatPrice(product.price)
        ) : (
          <span className="text-black/50">Sold out</span>
        )}
      </p>
    </Link>
  );
}
