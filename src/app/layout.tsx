
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { CartProvider } from "@/contexts/cart-context";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://YOUR-DOMAIN.com"),

  title: {
    default: "Hustlin Apparel Co. | Clothing & Streetwear",
    template: "%s | Hustlin Apparel Co.",
  },

  description:
    "Discover Hustlin Apparel Co. for clothing, apparel, and accessories. Explore our latest collections and shop your style.",

  applicationName: "Hustlin Apparel Co.",

  keywords: [
    "Hustlin Apparel Co.",
    "clothing",
    "streetwear",
    "apparel",
    "fashion",
    "clothing store",
  ],

  authors: [{ name: "Hustlin Apparel Co." }],

  icons: {
    icon: "/assets/logo.webp",
    apple: "/assets/logo.webp",
  },

  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: "Hustlin Apparel Co.",
    title: "Hustlin Apparel Co. | Clothing & Streetwear",
    description:
      "Discover our latest clothing collections and shop your style.",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hustlin Apparel Co.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Hustlin Apparel Co. | Clothing & Streetwear",
    description:
      "Discover our latest clothing collections and shop your style.",
    images: ["/assets/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="font-sans">
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="mx-auto w-full max-w-[1000px] flex-1 px-5 pb-12 pt-8 md:pt-12">
              {children}
            </main>
            <SiteFooter />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
