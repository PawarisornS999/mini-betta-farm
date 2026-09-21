/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getAdminProducts, getAdminRevenue } from "@/lib/admin/products";

export default async function AdminDashboardPage() {
  const [products, revenue] = await Promise.all([
    getAdminProducts(),
    getAdminRevenue(),
  ]);
  const available = products.filter(
    (p) => p.adminStatus === "available",
  ).length;
  const reserved = products.filter((p) => p.adminStatus === "reserved").length;
  const sold = products.filter((p) => p.adminStatus === "sold").length;
  const lowStock = products.filter(
    (p) => (p.stockQty ?? 0) <= 3 && (p.stockQty ?? 0) > 0,
  );
  const cards = [
    ["Total products", products.length, "◆", "All catalog records"],
    ["Available fish", available, "●", "Ready for customers"],
    ["Reserved", reserved, "◐", "Awaiting payment"],
    [
      "รายรับรวม",
      `฿${revenue.total.toLocaleString()}`,
      "฿",
      `${revenue.orders} ออเดอร์ที่ขายแล้ว`,
    ],
  ];
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-[#77776f]">
            ภาพรวมคลังสินค้า Mini Betta Farm
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            Good morning, Admin.
          </h2>
        </div>
        <Link
          href="/admin/products"
          className="rounded-xl bg-[#20201e] px-5 py-3 text-sm font-semibold text-white shadow-lg"
        >
          Manage products →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, icon, note]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-black/6 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-[#73736c]">{label}</p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f6ead8] text-[#ac6826]">
                {icon}
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold">{value}</p>
            <p className="mt-2 text-xs text-[#99998f]">{note}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-black/6 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Recently updated</h3>
              <p className="text-sm text-[#85857d]">
                สินค้าที่มีการแก้ไขล่าสุด
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-sm font-semibold text-[#a76424]"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 divide-y divide-black/5">
            {products.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center gap-4 py-3">
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-[#efe9df]">
                  {p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center">🐟</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-[#8a8a82]">
                    {p.sku} · {p.species}
                  </p>
                </div>
                <p className="text-sm font-bold">฿{p.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl bg-[#1d1d1b] p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Stock attention</h3>
            <span className="rounded-full bg-[#d68c30]/20 px-3 py-1 text-xs text-[#e9b96f]">
              {lowStock.length} items
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {lowStock.length ? (
              lowStock.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-white/40">{p.sku}</p>
                  </div>
                  <span className="font-bold text-[#e5a64c]">
                    {p.stockQty} left
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-white/5 p-5 text-sm text-white/50">
                ไม่มีสินค้าที่สต็อกต่ำ
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-between border-t border-white/10 pt-5 text-sm">
            <span className="text-white/45">Sold out</span>
            <strong>{sold}</strong>
          </div>
        </section>
      </div>
    </div>
  );
}
