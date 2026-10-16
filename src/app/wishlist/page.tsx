import { redirect } from "next/navigation";
import { getLineSession } from "@/lib/line/login";
import WishlistPageClient from "@/components/WishlistPageClient";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  if (!(await getLineSession())) redirect("/api/line/login?returnTo=%2Fwishlist");
  return <WishlistPageClient />;
}
