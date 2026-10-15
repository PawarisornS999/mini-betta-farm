import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description: "รู้จัก Betta World ฟาร์มปลากัดพรีเมียม คัดสรรปลากัดสวยงาม สุขภาพดี และจัดส่งทั่วประเทศไทย",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) { return children; }
