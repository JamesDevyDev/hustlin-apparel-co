"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { CartLink } from "./cart-link";

const navigationItems = [
  { label: "TOP", href: "/shop?category=tops" },
  { label: "BOTTOM", href: "/shop?category=bottoms" },
  { label: "ACCESSORIES", href: "/shop?category=accessories" },
  { label: "ANNOUNCEMENT", href: "/announcement" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1000px] w-full items-center justify-between px-5">
        <Link
          href="/shop"
          onClick={() => setMenuOpen(false)}
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

        <div className="flex items-center gap-5">
          <CartLink />
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px]"
          >
            <span className={`block h-[2px] w-6 bg-black transition-transform ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-[2px] w-6 bg-black transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-[2px] w-6 bg-black transition-transform ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      <div
        id="site-navigation"
        aria-hidden={!menuOpen}
        className={`absolute left-0 top-full w-full overflow-hidden border-t border-black/10 bg-white transition-[max-height,opacity] duration-300 ease-in-out ${
          menuOpen ? "max-h-80 opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <nav aria-label="Main navigation" className="mx-auto flex max-w-[1000px] flex-col px-5 py-4">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
              className="border-b border-black/10 py-4 text-sm font-medium uppercase tracking-[0.18em] transition-opacity last:border-b-0 hover:opacity-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
