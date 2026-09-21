import type { Metadata } from "next";
import "./globals.css";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { LanguageFont } from "@/components/LanguageFont";

const BASE_URL = "https://minibettafarm.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Aurora Betta Farm — ปลากัดพรีเมียม จำหน่ายปลากัดสวยงาม",
    template: "%s | Aurora Betta Farm",
  },
  description:
    "จำหน่ายปลากัดพรีเมียม ปลากัด Halfmoon Crowntail Plakat Giant และอื่นๆ คัดเกรด มีสุขภาพดี จัดส่งทั่วประเทศ รับประกันปลามีชีวิต",
  keywords: [
    "ปลากัด",
    "ปลากัดสวยงาม",
    "เลี้ยงปลากัด",
    "ปลากัด halfmoon",
    "ปลากัด crowntail",
    "วิธีเลี้ยงปลากัด",
    "ซื้อปลากัด",
    "betta fish thailand",
  ],
  authors: [{ name: "Aurora Betta Farm", url: BASE_URL }],
  creator: "Aurora Betta Farm",
  publisher: "Aurora Betta Farm",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "Aurora Betta Farm — ปลากัดพรีเมียม จำหน่ายปลากัดสวยงาม",
    description:
      "จำหน่ายปลากัดพรีเมียม ปลากัด Halfmoon Crowntail Plakat Giant และอื่นๆ จัดส่งทั่วประเทศ",
    type: "website",
    locale: "th_TH",
    siteName: "Aurora Betta Farm",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Aurora Betta Farm",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurora Betta Farm — ปลากัดพรีเมียม",
    description: "จำหน่ายปลากัดพรีเมียม จัดส่งทั่วประเทศ",
    images: [`${BASE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="scroll-smooth">
      <head>
        <OrganizationJsonLd />
      </head>
      <body className="font-sans antialiased">
        <LanguageFont />
        {children}
      </body>
    </html>
  );
}
