import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "วิธีสั่งซื้อปลากัดออนไลน์",
  description:
    "ดูขั้นตอนเลือกซื้อปลากัดจาก Aurora Betta Farm ตั้งแต่เลือกปลา ชำระเงิน แจ้งชำระเงิน ไปจนถึงการจัดส่งทั่วประเทศไทย",
  alternates: { canonical: "/how-to-order" },
  openGraph: {
    title: "วิธีสั่งซื้อปลากัดออนไลน์ | Aurora Betta Farm",
    description: "ขั้นตอนสั่งซื้อและรับปลากัดจัดส่งถึงบ้านอย่างเข้าใจง่าย",
    url: "/how-to-order",
    images: ["/assets/bettaHMPKHero.png"],
  },
};

export default function HowToOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
