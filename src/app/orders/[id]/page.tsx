import OrderStatusClient from "./OrderStatusClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "คำสั่งซื้อของฉัน", robots: { index: false, follow: false } };

export default async function OrderStatusPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderStatusClient id={id} />;
}
