"use client";

import { useState } from "react";
import type { Category } from "@/types";
import { adminText, useAdminLanguage } from "./LanguageProvider";

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: string;
  isActive: boolean;
};

const empty: Draft = { name: "", slug: "", description: "", image: "", sortOrder: "0", isActive: true };

function toDraft(category: Category): Draft {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? "",
    sortOrder: String(category.sortOrder ?? 0),
    isActive: category.isActive !== false,
  };
}

export default function CategoriesAdminClient({ initialCategories }: { initialCategories: Category[] }) {
  const { language } = useAdminLanguage();
  const text = (th: string, en: string) => adminText(language, th, en);
  const [categories, setCategories] = useState(initialCategories);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function field<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  async function save() {
    if (!draft?.name.trim()) {
      setError(text("กรุณากรอกชื่อหมวดหมู่", "Please enter a category name"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        draft.id ? `/api/admin/categories/${draft.id}` : "/api/admin/categories",
        {
          method: draft.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...draft, sortOrder: Number(draft.sortOrder || 0) }),
        },
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? text("บันทึกไม่สำเร็จ", "Unable to save category"));
      setCategories((current) => draft.id
        ? current.map((item) => item.id === draft.id ? body.data : item)
        : [...current, body.data]);
      setDraft(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : text("บันทึกไม่สำเร็จ", "Unable to save category"));
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(category: Category) {
    if (!window.confirm(text(
      `ซ่อนหมวดหมู่ “${category.name}” จากหน้าร้านหรือไม่?`,
      `Hide “${category.name}” from the storefront?`,
    ))) return;
    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError(text("ซ่อนหมวดหมู่ไม่สำเร็จ", "Unable to hide category"));
      return;
    }
    setCategories((current) => current.map((item) =>
      item.id === category.id ? { ...item, isActive: false } : item,
    ));
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-[#7d7d75]">
            {text("จัดกลุ่มปลากัดที่แสดงในหน้าร้าน", "Organize the betta fish shown on the storefront")}
          </p>
          <h2 className="mt-1 text-3xl font-bold">{text("จัดการหมวดหมู่", "Category management")}</h2>
        </div>
        <button onClick={() => { setError(""); setDraft({ ...empty }); }} className="rounded-xl bg-gradient-to-r from-[#d79639] to-[#ba6c22] px-5 py-3 text-sm font-bold text-white">
          ＋ {text("เพิ่มหมวดหมู่", "Add category")}
        </button>
      </div>
      {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <section className="overflow-x-auto rounded-2xl border border-black/6 bg-white">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[1fr_120px_130px_150px] border-b border-black/6 bg-[#fafaf8] px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-[#8a8a82]">
            <span>{text("หมวดหมู่", "Category")}</span><span>{text("สินค้า", "Products")}</span><span>{text("สถานะ", "Status")}</span><span className="text-right">{text("การจัดการ", "Actions")}</span>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="grid grid-cols-[1fr_120px_130px_150px] items-center border-b border-black/5 px-5 py-4">
              <div><p className="font-semibold">{category.name}</p><p className="mt-1 font-mono text-xs text-[#a16522]">{category.slug}</p></div>
              <span className="text-sm">{category.productCount}</span>
              <span className={`text-xs font-bold ${category.isActive ? "text-emerald-600" : "text-slate-400"}`}>{category.isActive ? text("ใช้งาน", "Active") : text("ซ่อนแล้ว", "Hidden")}</span>
              <div className="flex justify-end gap-2">
                <button onClick={() => { setError(""); setDraft(toDraft(category)); }} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold">{text("แก้ไข", "Edit")}</button>
                {category.isActive && <button onClick={() => void deactivate(category)} className="rounded-lg border border-black/10 px-3 py-2 text-xs text-red-600">{text("ซ่อน", "Hide")}</button>}
              </div>
            </div>
          ))}
          {!categories.length && <p className="p-12 text-center text-sm text-[#888]">{text("ยังไม่มีหมวดหมู่", "No categories yet")}</p>}
        </div>
      </section>

      {draft && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-5">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{draft.id ? text("แก้ไขหมวดหมู่", "Edit category") : text("เพิ่มหมวดหมู่", "Add category")}</h3>
              <button onClick={() => setDraft(null)} className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2f2ef] text-xl">×</button>
            </div>
            <div className="mt-6 space-y-4">
              <Field label={text("ชื่อ *", "Name *")}><input value={draft.name} onChange={(event) => field("name", event.target.value)} className="input-admin" /></Field>
              <Field label="Slug"><input value={draft.slug} onChange={(event) => field("slug", event.target.value)} placeholder="halfmoon" className="input-admin" /></Field>
              <Field label={text("รายละเอียด", "Description")}><textarea value={draft.description} onChange={(event) => field("description", event.target.value)} rows={3} className="input-admin resize-none" /></Field>
              <Field label={text("URL รูปภาพ", "Image URL")}><input value={draft.image} onChange={(event) => field("image", event.target.value)} className="input-admin" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={text("ลำดับการแสดง", "Sort order")}><input type="number" value={draft.sortOrder} onChange={(event) => field("sortOrder", event.target.value)} className="input-admin" /></Field>
                <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={draft.isActive} onChange={(event) => field("isActive", event.target.checked)} className="h-5 w-5 accent-[#c98029]" /> {text("เปิดใช้งาน", "Active")}</label>
              </div>
            </div>
            <div className="mt-7 flex justify-end gap-3">
              <button onClick={() => setDraft(null)} className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold">{text("ยกเลิก", "Cancel")}</button>
              <button disabled={saving} onClick={() => void save()} className="rounded-xl bg-[#20201e] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? text("กำลังบันทึก...", "Saving...") : text("บันทึกหมวดหมู่", "Save category")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-[#6f6f68]">{label}</span>{children}</label>;
}
