import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ติดต่อ Aurora Betta Farm เพื่อสอบถามปลากัด การสั่งซื้อ การจัดส่ง และคำแนะนำในการดูแลปลา",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) { return children; }
