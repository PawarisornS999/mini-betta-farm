import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เลือกซื้อปลากัดพรีเมียม",
  description: "เลือกซื้อปลากัดสวยงามคัดเกรด Halfmoon, Plakat, Crowntail และสายพันธุ์หายาก พร้อมจัดส่งทั่วประเทศ",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "เลือกซื้อปลากัดพรีเมียม | Aurora Betta Farm",
    description: "รวมปลากัดสวยงามคัดเกรด พร้อมจัดส่งทั่วประเทศ",
    url: "/shop",
    images: ["/assets/bettaHMPKHero.png"],
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
