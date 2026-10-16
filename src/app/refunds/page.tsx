import { redirect } from "next/navigation";
import { getLineSession } from "@/lib/line/login";
import RefundsClient from "./RefundsClient";

export const metadata = { title: "ติดตามการคืนเงิน", robots: { index: false, follow: false } };

export default async function RefundsPage({ searchParams }: {
  searchParams: Promise<{ new?: string; orderId?: string }>;
}) {
  const query = await searchParams;
  if (!(await getLineSession())) {
    const returnTo = new URLSearchParams();
    if (query.new === "1") returnTo.set("new", "1");
    if (query.orderId) returnTo.set("orderId", query.orderId);
    const path = `/refunds${returnTo.size ? `?${returnTo}` : ""}`;
    redirect(`/api/line/login?returnTo=${encodeURIComponent(path)}`);
  }
  return <RefundsClient startNew={query.new === "1"} orderId={query.orderId || ""} />;
}
