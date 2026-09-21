/* eslint-disable @next/next/no-img-element */
"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Category, Product } from "@/types";
import { adminText, useAdminLanguage } from "./LanguageProvider";
import BaseDropdown from "../BaseDropdown";
import Modal from "../Modal";

type FormState = {
  id?: string;
  name: string;
  sku: string;
  slug: string;
  price: string;
  cost: string;
  species: string;
  category: string;
  color: string;
  gender: "male" | "female" | "unsexed";
  pattern: string;
  tailType: string;
  ageMonths: string;
  sizeCm: string;
  stockQty: string;
  adminStatus: "draft" | "available" | "reserved" | "sold" | "hidden";
  description: string;
  images: string;
  badge: string;
  featured: boolean;
};

const emptyForm: FormState = {
  name: "",
  sku: "",
  slug: "",
  price: "",
  cost: "",
  species: "Halfmoon",
  category: "betta-fish",
  color: "",
  gender: "male",
  pattern: "",
  tailType: "Halfmoon",
  ageMonths: "",
  sizeCm: "",
  stockQty: "1",
  adminStatus: "available",
  description: "",
  images: "",
  badge: "",
  featured: false,
};
const statuses = [
  "all",
  "available",
  "reserved",
  "sold",
  "draft",
  "hidden",
] as const;

function statusClass(status?: string) {
  return status === "available"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
    : status === "reserved"
      ? "bg-amber-50 text-amber-700 ring-amber-600/15"
      : status === "sold"
        ? "bg-slate-100 text-slate-600 ring-slate-500/15"
        : status === "hidden"
          ? "bg-red-50 text-red-600 ring-red-500/15"
          : "bg-violet-50 text-violet-700 ring-violet-500/15";
}

function productToForm(product: Product): FormState {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku ?? "",
    slug: product.slug ?? "",
    price: String(product.price),
    cost: String(product.cost ?? 0),
    species: product.species,
    category: product.category ?? "betta-fish",
    color: product.color,
    gender: product.gender ?? "unsexed",
    pattern: product.pattern ?? "",
    tailType: product.tailType ?? product.species,
    ageMonths: product.ageMonths ? String(product.ageMonths) : "",
    sizeCm: product.sizeCm ? String(product.sizeCm) : "",
    stockQty: String(product.stockQty ?? 0),
    adminStatus: product.adminStatus ?? "available",
    description: product.description,
    images: product.images.join("\n"),
    badge: product.badge ?? "",
    featured: Boolean(product.featured),
  };
}

export default function ProductsAdminClient({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const { language } = useAdminLanguage();
  const text = (th: string, en: string) => adminText(language, th, en);
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [form, setForm] = useState<FormState | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [delta, setDelta] = useState("1");
  const [reason, setReason] = useState("manual_adjustment");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const query = search.toLowerCase();
        const matchesSearch =
          !query ||
          product.name.toLowerCase().includes(query) ||
          product.sku?.toLowerCase().includes(query) ||
          product.species.toLowerCase().includes(query);
        return (
          matchesSearch && (status === "all" || product.adminStatus === status)
        );
      }),
    [products, search, status],
  );

  const counts = useMemo(
    () => ({
      total: products.length,
      available: products.filter((p) => p.adminStatus === "available").length,
      reserved: products.filter((p) => p.adminStatus === "reserved").length,
      sold: products.filter((p) => p.adminStatus === "sold").length,
    }),
    [products],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function uploadImage(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("รูปภาพต้องมีขนาดไม่เกิน 10 MB");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: data,
      });
      const body = (await response.json().catch(() => null)) as {
        message?: string;
        data?: { url?: string };
      } | null;
      if (!response.ok || !body?.data?.url) {
        throw new Error(
          body?.message ?? `อัปโหลดรูปไม่สำเร็จ (${response.status})`,
        );
      }
      const imageUrl = body.data.url;
      setForm((current) =>
        current
          ? {
              ...current,
              images: [current.images.trim(), imageUrl]
                .filter(Boolean)
                .join("\n"),
            }
          : current,
      );
      showToast("อัปโหลดรูปสินค้าแล้ว");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setUploading(false);
    }
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      cost: Number(form.cost || 0),
      ageMonths: form.ageMonths ? Number(form.ageMonths) : undefined,
      sizeCm: form.sizeCm ? Number(form.sizeCm) : undefined,
      stockQty: Number(form.stockQty),
      images: form.images
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const response = await fetch(
      form.id ? `/api/admin/products/${form.id}` : "/api/admin/products",
      {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = await response.json();
    if (!response.ok) {
      setError(body.message ?? "บันทึกสินค้าไม่สำเร็จ");
      setSaving(false);
      return;
    }
    setProducts((current) =>
      form.id
        ? current.map((item) => (item.id === form.id ? body.data : item))
        : [body.data, ...current],
    );
    setForm(null);
    setSaving(false);
    showToast(form.id ? "อัปเดตสินค้าแล้ว" : "เพิ่มสินค้าแล้ว");
  }

  async function hideProduct(product: Product) {
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "ซ่อนสินค้าไม่สำเร็จ");
      return;
    }
    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, adminStatus: "hidden", published: false } : item));
    setDeleteProductTarget(null);
  }

  async function adjustStock(event: FormEvent) {
    event.preventDefault();
    if (!stockProduct) return;
    setSaving(true);
    setError("");
    const response = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: stockProduct.id,
        delta: Number(delta),
        reason,
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.message ?? "ปรับสต็อกไม่สำเร็จ");
      setSaving(false);
      return;
    }
    setProducts((current) =>
      current.map((item) =>
        item.id === stockProduct.id
          ? {
              ...item,
              stockQty: body.data.stockQty,
              stockStatus: body.data.stockStatus,
              adminStatus: body.data.adminStatus,
            }
          : item,
      ),
    );
    setStockProduct(null);
    setSaving(false);
    setDelta("1");
    showToast("ปรับสต็อกเรียบร้อยแล้ว");
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      {toast && (
        <div className="fixed right-5 top-24 z-[80] rounded-xl bg-[#20201e] px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          ✓ {toast}
        </div>
      )}
      <div className="mb-2 text-right text-[10px] font-semibold uppercase tracking-widest text-[#a16522]">
        {text("โหมดภาษาไทย", "English mode")}
      </div>
      <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm text-[#7d7d75]">
            จัดการปลากัดแบบรายตัว ราคา สถานะ และสต็อก
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            Product management
          </h2>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#55554f]">
            ↓ Export
          </button>
          <button
            onClick={() => {
              setError("");
              setForm({ ...emptyForm });
            }}
            className="rounded-xl bg-gradient-to-r from-[#d79639] to-[#ba6c22] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/15"
          >
            ＋ Add product
          </button>
        </div>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["สินค้าทั้งหมด", counts.total, "#222"],
          ["พร้อมขาย", counts.available, "#18825e"],
          ["จองแล้ว", counts.reserved, "#b06e14"],
          ["ขายแล้ว", counts.sold, "#667085"],
        ].map(([label, value, color]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-black/6 bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#92928a]">
              {label}
            </p>
            <p
              className="mt-2 text-3xl font-bold"
              style={{ color: String(color) }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
      <section className="overflow-hidden rounded-2xl border border-black/6 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-black/6 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99998f]">
              ⌕
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า, SKU หรือสายพันธุ์..."
              className="w-full rounded-xl border border-black/8 bg-[#fafaf8] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#d28a31]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <BaseDropdown
              value={status}
              onChange={setStatus}
              options={statuses.map((item) => ({ value: item, label: ({ all: "ทั้งหมด", available: "พร้อมขาย", reserved: "จองแล้ว", sold: "ขายแล้ว", draft: "ฉบับร่าง", hidden: "ซ่อนแล้ว" } as Record<string, string>)[item] }))}
              className="min-w-36"
            />
          </div>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1050px] text-left">
            <thead>
              <tr className="border-b border-black/6 bg-[#fafaf8] text-[11px] uppercase tracking-[.12em] text-[#8a8a82]">
                <th className="px-5 py-4">สินค้า</th>
                <th className="px-5 py-4">SKU / สายพันธุ์</th>
                <th className="px-5 py-4">เพศ</th>
                <th className="px-5 py-4">ราคา</th>
                <th className="px-5 py-4">สต็อก</th>
                <th className="px-5 py-4">สถานะ</th>
                <th className="px-5 py-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((product) => (
                <tr key={product.id} className="group hover:bg-[#fcfbf8]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-[#eee9df]">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid h-full place-items-center text-xl">
                            🐟
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="mt-1 max-w-[260px] truncate text-xs text-[#96968d]">
                          {product.color}
                          {product.pattern ? ` · ${product.pattern}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-bold text-[#9d6123]">
                      {product.sku}
                    </p>
                    <p className="mt-1 text-sm text-[#6d6d66]">
                      {product.species}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm capitalize">
                    {product.gender ?? "—"}
                  </td>
                  <td className="px-5 py-4 font-semibold">
                    ฿{product.price.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => {
                        setError("");
                        setStockProduct(product);
                        setDelta("1");
                      }}
                      className="rounded-lg bg-[#f4f1eb] px-3 py-2 font-bold hover:bg-[#eee6da]"
                    >
                      {product.stockQty ?? 0}{" "}
                      <span className="ml-1 text-xs font-normal text-[#8b8174]">
                        adjust
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusClass(product.adminStatus)}`}
                    >
                      {product.adminStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setError("");
                          setForm(productToForm(product));
                        }}
                        className="rounded-lg border border-black/8 px-3 py-2 text-xs font-semibold hover:border-[#d28a31] hover:text-[#a86524]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteProductTarget(product)}
                        className="rounded-lg border border-black/8 px-3 py-2 text-xs font-semibold text-red-600 hover:border-red-200 hover:bg-red-50"
                      >
                        Hide
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-black/6 md:hidden">
          {filtered.map((product) => (
            <div key={product.id} className="p-4">
              <div className="flex gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#eee9df]">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center">🐟</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="truncate font-semibold">{product.name}</p>
                      <p className="text-xs text-[#9a642d]">{product.sku}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ring-1 ring-inset ${statusClass(product.adminStatus)}`}
                    >
                      {product.adminStatus}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bold">
                      ฿{product.price.toLocaleString()}
                    </p>
                    <p className="text-sm">
                      Stock <b>{product.stockQty ?? 0}</b>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setForm(productToForm(product))}
                  className="flex-1 rounded-lg bg-[#20201e] py-2 text-xs font-semibold text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => setStockProduct(product)}
                  className="flex-1 rounded-lg bg-[#f0ece4] py-2 text-xs font-semibold"
                >
                  Adjust stock
                </button>
                <button
                  onClick={() => setDeleteProductTarget(product)}
                  className="flex-1 rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-600"
                >
                  Hide
                </button>
              </div>
            </div>
          ))}
        </div>
        {!filtered.length && (
          <div className="py-20 text-center">
            <p className="text-4xl">🐟</p>
            <p className="mt-3 font-semibold">ไม่พบสินค้า</p>
            <p className="mt-1 text-sm text-[#92928a]">
              ลองเปลี่ยนคำค้นหาหรือตัวกรอง
            </p>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-black/6 px-5 py-4 text-xs text-[#83837b]">
          <span>
            Showing {filtered.length} of {products.length} products
          </span>
              <span>หน้า 1 จาก 1</span>
        </div>
      </section>

      {form && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <form
            onSubmit={saveProduct}
            className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/6 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#b1742c]">
                  Product editor
                </p>
                <h3 className="text-xl font-bold">
                  {form.id ? "Edit product" : "Add new fish"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2f2ef] text-xl"
              >
                ×
              </button>
            </div>
            <div className="grid gap-7 p-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-6">
                <FormSection title="Product information">
                  <Field label="Product name *">
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      className="input-admin"
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="SKU *">
                      <input
                        required
                        value={form.sku}
                        onChange={(e) =>
                          setField("sku", e.target.value.toUpperCase())
                        }
                        className="input-admin font-mono"
                      />
                    </Field>
                    <Field label="URL slug">
                      <input
                        value={form.slug}
                        onChange={(e) => setField("slug", e.target.value)}
                        className="input-admin"
                      />
                    </Field>
                  </div>
                  <div className="flex flex-col gap-4">
                      <Field label="Strain">
                      <input
                        required
                        value={form.species}
                        onChange={(e) => setField("species", e.target.value)}
                        className="input-admin"
                      />
                      </Field>
                      <Field label="Category *">
                        <BaseDropdown value={form.category} onChange={(value) => setField("category", value)} options={categories.filter((category) => category.isActive !== false).map((category) => ({ value: category.slug, label: category.name }))} />
                      </Field>
                    <Field label="Color *">
                      <input
                        required
                        value={form.color}
                        onChange={(e) => setField("color", e.target.value)}
                        className="input-admin"
                      />
                    </Field>
                    <Field label="Gender">
                      <BaseDropdown
                        value={form.gender}
                        onChange={(value) => setField("gender", value as FormState["gender"])}
                        options={[{ value: "male", label: "เพศผู้" }, { value: "female", label: "เพศเมีย" }, { value: "unsexed", label: "ไม่ระบุเพศ" }]}
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Pattern">
                      <input
                        value={form.pattern}
                        onChange={(e) => setField("pattern", e.target.value)}
                        className="input-admin"
                      />
                    </Field>
                    <Field label="Tail type">
                      <input
                        value={form.tailType}
                        onChange={(e) => setField("tailType", e.target.value)}
                        className="input-admin"
                      />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea
                      rows={5}
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                      className="input-admin resize-none"
                    />
                  </Field>
                </FormSection>
                <FormSection title="Product images">
                  <label
                    className={`flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#d7b17d] bg-[#fffaf2] px-4 py-4 text-sm font-bold text-[#9c6226] ${uploading ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <span>
                      {uploading
                        ? "กำลังอัปโหลด..."
                        : "↑ อัปโหลด JPG, PNG หรือ WebP"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadImage(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <p className="text-xs text-[#8a8a82]">
                    สูงสุด 10 MB และเก็บใน Supabase Storage
                  </p>
                  <Field label="Image URLs (one per line)">
                    <textarea
                      rows={4}
                      value={form.images}
                      onChange={(e) => setField("images", e.target.value)}
                      placeholder="https://.../betta.webp"
                      className="input-admin resize-none font-mono text-xs"
                    />
                  </Field>
                  {form.images.split("\n").filter(Boolean)[0] && (
                    <img
                      src={form.images.split("\n").filter(Boolean)[0]}
                      alt="Preview"
                      className="h-48 w-full rounded-xl bg-[#f1eee8] object-cover"
                    />
                  )}
                </FormSection>
              </div>
              <div className="space-y-6">
                <FormSection title="Pricing & inventory">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <Field label="Price (THB) *">
                      <input
                        required
                        min="0"
                        type="number"
                        value={form.price}
                        onChange={(e) => setField("price", e.target.value)}
                        className="input-admin"
                      />
                    </Field>
                    <Field label="Cost (THB)">
                      <input
                        min="0"
                        type="number"
                        value={form.cost}
                        onChange={(e) => setField("cost", e.target.value)}
                        className="input-admin"
                      />
                    </Field>
                    <Field label="Stock *">
                      <input
                        required
                        min="0"
                        type="number"
                        value={form.stockQty}
                        onChange={(e) => setField("stockQty", e.target.value)}
                        className="input-admin"
                        disabled={Boolean(form.id)}
                      />
                    </Field>
                    <Field label="Status">
                      <BaseDropdown
                        value={form.adminStatus}
                        onChange={(value) => setField("adminStatus", value as FormState["adminStatus"])}
                        options={["available", "reserved", "sold", "draft", "hidden"].map((value) => ({ value, label: ({ available: "พร้อมขาย", reserved: "จองแล้ว", sold: "ขายแล้ว", draft: "ฉบับร่าง", hidden: "ซ่อนแล้ว" } as Record<string, string>)[value] }))}
                      />
                    </Field>
                    <Field label="Age (months)">
                      <input
                        min="0"
                        type="number"
                        value={form.ageMonths}
                        onChange={(e) => setField("ageMonths", e.target.value)}
                        className="input-admin"
                      />
                    </Field>
                    <Field label="Size (cm)">
                      <input
                        min="0"
                        step="0.1"
                        type="number"
                        value={form.sizeCm}
                        onChange={(e) => setField("sizeCm", e.target.value)}
                        className="input-admin"
                      />
                    </Field>
                  </div>
                </FormSection>
                <FormSection title="Merchandising">
                  <Field label="Badge">
                    <input
                      value={form.badge}
                      onChange={(e) => setField("badge", e.target.value)}
                      placeholder="Rare, Premium..."
                      className="input-admin"
                    />
                  </Field>
                  <label className="flex cursor-pointer items-center justify-between rounded-xl bg-[#f6f3ed] p-4">
                    <div>
                      <p className="text-sm font-semibold">Featured product</p>
                      <p className="text-xs text-[#878077]">
                        แสดงสินค้าในส่วนแนะนำ
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setField("featured", e.target.checked)}
                      className="h-5 w-5 accent-[#c98029]"
                    />
                  </label>
                </FormSection>
                {error && (
                  <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-black/6 bg-white/95 px-6 py-4 backdrop-blur">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-xl border border-black/10 px-5 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={saving || uploading}
                className="rounded-xl bg-[#20201e] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : form.id
                    ? "Save changes"
                    : "Create product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {stockProduct && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-5 backdrop-blur-sm">
          <form
            onSubmit={adjustStock}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#b1742c]">
                  Inventory adjustment
                </p>
                <h3 className="mt-1 text-xl font-bold">{stockProduct.name}</h3>
                <p className="mt-1 text-sm text-[#85857d]">
                  Current stock: <b>{stockProduct.stockQty ?? 0}</b>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStockProduct(null)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2f2ef] text-xl"
              >
                ×
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <Field label="Change quantity">
                <input
                  autoFocus
                  required
                  type="number"
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                  className="input-admin text-lg font-bold"
                />
                <p className="mt-1 text-xs text-[#8a8a82]">
                  ใช้ค่าบวกเพื่อเพิ่ม และค่าลบเพื่อลดสต็อก
                </p>
              </Field>
              <Field label="Reason">
                <BaseDropdown
                  value={reason}
                  onChange={setReason}
                  options={[{ value: "new_stock", label: "New stock" }, { value: "manual_adjustment", label: "Manual adjustment" }, { value: "damaged", label: "Damaged fish" }, { value: "reservation_release", label: "Reservation release" }]}
                />
              </Field>
              {error && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStockProduct(null)}
                className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={saving || !Number(delta)}
                className="rounded-xl bg-[#20201e] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? "Adjusting..." : "Confirm adjustment"}
              </button>
            </div>
          </form>
        </div>
      )}
      <Modal
        isOpen={Boolean(deleteProductTarget)}
        onClose={() => setDeleteProductTarget(null)}
        onConfirm={() => deleteProductTarget && void hideProduct(deleteProductTarget)}
        title="ซ่อนสินค้าใช่ไหม?"
        description={deleteProductTarget ? `สินค้า “${deleteProductTarget.name}” จะถูกซ่อนจากหน้าร้าน แต่ข้อมูลและประวัติออเดอร์จะยังคงอยู่` : undefined}
        variant="warning"
        confirmText="ซ่อนสินค้า"
        cancelText="ยกเลิก"
      />
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/7 p-5">
      <h4 className="mb-4 font-bold">{title}</h4>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const isRequired = label.trim().endsWith("*");
  const labelText = isRequired ? label.trim().slice(0, -1).trim() : label;

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#6f6f68]">
        {labelText}
        {isRequired && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
      </span>
      {children}
    </label>
  );
}
