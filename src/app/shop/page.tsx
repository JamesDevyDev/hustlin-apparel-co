import type { Metadata } from "next";
import { categoryBySlug } from "@/lib/db/queries";
import { FeaturedHero } from "@/components/products/featured-hero";
import { ProductGrid } from "@/components/products/product-grid";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: slug } = await searchParams;
  const category = slug ? await categoryBySlug(slug) : null;

  return (
    <>
      {!category && <FeaturedHero />}
      {category && (
        <h1 className="mb-8 text-center text-sm uppercase tracking-[0.18em]">
          {category.name}
        </h1>
      )}
      <ProductGrid category={category?.slug} />
    </>
  );
}
