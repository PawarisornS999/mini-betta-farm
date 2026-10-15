import type { Metadata } from "next";
import "./globals.css";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { LanguageFont } from "@/components/LanguageFont";

const BASE_URL = "https://minibettafarm.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  applicationName: "Betta World",
  title: {
    default: "Betta World — ปลากัดพรีเมียม จำหน่ายปลากัดสวยงาม",
    template: "%s | Betta World",
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
  authors: [{ name: "Betta World", url: BASE_URL }],
  creator: "Betta World",
  publisher: "Betta World",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "Betta World — ปลากัดพรีเมียม จำหน่ายปลากัดสวยงาม",
    description:
      "จำหน่ายปลากัดพรีเมียม ปลากัด Halfmoon Crowntail Plakat Giant และอื่นๆ จัดส่งทั่วประเทศ",
    type: "website",
    locale: "th_TH",
    siteName: "Betta World",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/assets/bettaHMPKHero.png`,
        width: 1200,
        height: 630,
        alt: "Betta World",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Betta World — ปลากัดพรีเมียม",
    description: "จำหน่ายปลากัดพรีเมียม จัดส่งทั่วประเทศ",
    images: [`${BASE_URL}/assets/bettaHMPKHero.png`],
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
