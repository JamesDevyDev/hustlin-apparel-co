
import Link from "next/link";
import Image from "next/image";
import { categories } from "@/data/categories";
import { CartLink } from "./cart-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1000px] w-full items-center justify-between px-5">
        <Link
          href="/shop"
          className="flex items-center justify-center gap-2 text-md sm:text-xl md:text-[26px] font-black uppercase leading-none tracking-[-0.06em]"
        >
          <div className="relative h-[50px] w-[50px] shrink-0">
            <Image
              src="/assets/logo-black.png"
              alt="Hustlin Apparel Co. Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          Hustlin Apparel Co.
        </Link>

        <nav
          aria-label="Main"
          className="flex items-center gap-5 sm:gap-7"
        >
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="text-xs uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
            >
              {c.name}
            </Link>
          ))}

          <CartLink />
        </nav>
      </div>
    </header>
  );
}
