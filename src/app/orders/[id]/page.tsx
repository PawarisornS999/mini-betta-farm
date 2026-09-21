import OrderStatusClient from "./OrderStatusClient";

export default async function OrderStatusPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ id }, { token }] = await Promise.all([params, searchParams]);
  return <OrderStatusClient id={id} token={token || ""} />;
}
