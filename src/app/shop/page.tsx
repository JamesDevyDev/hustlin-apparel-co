import type { Metadata } from "next";
import { categoryBySlug } from "@/lib/db/queries";
import { FeaturedHero } from "@/components/products/featured-hero";
import { ProductGrid } from "@/components/products/product-grid";
import { getAboutContent } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: slug } = await searchParams;
  const category = slug ? await categoryBySlug(slug) : null;
  const about = await getAboutContent();

  return (
    <>
      {!category && <FeaturedHero />}
      {!category && about && <section className="flex min-h-[60vh] flex-col justify-center text-black px-8 py-20 md:min-h-[70vh] md:px-16">
        <h1 className="text-4xl font-black uppercase tracking-tight md:text-6xl">{about.header}</h1>
        <p className="mt-8 max-w-3xl whitespace-pre-wrap text-base leading-relaxed md:text-lg">{about.body}</p>
      </section>}
      {category && (
        <h1 className="mb-8 text-center text-sm uppercase tracking-[0.18em]">
          {category.name}
        </h1>
      )}
      <ProductGrid category={category?.slug} />
    </>
  );
}
