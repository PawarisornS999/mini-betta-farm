import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "บทความและคู่มือดูแลปลากัด",
  description: "บทความวิธีเลี้ยงปลากัด การให้อาหาร การดูแลน้ำ การรักษาโรค และข้อมูลสายพันธุ์สำหรับผู้เลี้ยงปลากัด",
  alternates: { canonical: "/blog" },
  openGraph: { title: "บทความและคู่มือดูแลปลากัด", description: "คู่มือดูแลปลากัดจาก Aurora Betta Farm", url: "/blog", images: ["/assets/bettaHMPKHero.png"] },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) { return children; }
