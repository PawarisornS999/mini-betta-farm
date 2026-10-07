/* eslint-disable @next/next/no-img-element */
"use client";

import { FormEvent, useMemo, useState } from "react";
import type { BlogCategory, BlogPost } from "@/types";
import BaseDropdown from "../BaseDropdown";
import Modal from "../Modal";
import { adminText, useAdminLanguage } from "./LanguageProvider";

type BlogDraft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: BlogCategory;
  tags: string;
  author: string;
  readTime: string;
  relatedSlugs: string;
  published: boolean;
  publishedAt?: string;
  seoTitle: string;
  seoDescription: string;
};

const emptyDraft: BlogDraft = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "Care Guide",
  tags: "",
  author: "Mini Betta Farm",
  readTime: "1 min read",
  relatedSlugs: "",
  published: false,
  seoTitle: "",
  seoDescription: "",
};

const categoryOptions: BlogCategory[] = [
  "Care Guide",
  "Health",
  "Species",
  "Breeding",
  "Equipment",
  "Education",
  "news",
];

function toDraft(post: BlogPost): BlogDraft {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    category: post.category,
    tags: post.tags?.join(", ") ?? "",
    author: post.author,
    readTime: String(post.readTime),
    relatedSlugs: post.relatedSlugs.join("\n"),
    published: Boolean(post.published),
    publishedAt: post.published ? post.date : undefined,
    seoTitle: post.seoTitle ?? post.seo?.title ?? "",
    seoDescription: post.seoDescription ?? post.seo?.description ?? "",
  };
}

function displayDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function BlogsAdminClient({
  initialBlogs,
}: {
  initialBlogs: BlogPost[];
}) {
  const { language } = useAdminLanguage();
  const text = (th: string, en: string) => adminText(language, th, en);
  const [blogs, setBlogs] = useState(initialBlogs);
  const [draft, setDraft] = useState<BlogDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return blogs.filter((post) => {
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query);
      const matchesStatus =
        status === "all" ||
        (status === "published" ? post.published : !post.published);
      return matchesQuery && matchesStatus;
    });
  }, [blogs, search, status]);

  const counts = useMemo(
    () => ({
      all: blogs.length,
      published: blogs.filter((post) => post.published).length,
      draft: blogs.filter((post) => !post.published).length,
      categories: new Set(blogs.map((post) => post.category)).size,
    }),
    [blogs],
  );

  function field<K extends keyof BlogDraft>(key: K, value: BlogDraft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function updateReadTime(content: string) {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setDraft((current) =>
      current
        ? {
            ...current,
            content,
            readTime: `${Math.max(1, Math.ceil(words / 200))} min read`,
          }
        : current,
    );
  }

  async function uploadCover(file: File) {
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setError(
        text(
          "รองรับ JPG, PNG หรือ WebP ขนาดไม่เกิน 10 MB",
          "Use a JPG, PNG, or WebP file up to 10 MB",
        ),
      );
      return;
    }
    setUploading(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("file", file);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: payload,
      });
      const body = await response.json();
      if (!response.ok || !body.data?.url)
        throw new Error(
          body.message ?? text("อัปโหลดไม่สำเร็จ", "Upload failed"),
        );
      field("coverImage", body.data.url);
      notify(text("อัปโหลดรูปปกแล้ว", "Cover image uploaded"));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : text("อัปโหลดไม่สำเร็จ", "Upload failed"),
      );
    } finally {
      setUploading(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError("");
    const payload = {
      ...draft,
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      relatedSlugs: draft.relatedSlugs
        .split("\n")
        .map((slug) => slug.trim())
        .filter(Boolean),
    };
    try {
      const response = await fetch(
        draft.id ? `/api/admin/blogs/${draft.id}` : "/api/admin/blogs",
        {
          method: draft.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.message ?? text("บันทึกบทความไม่สำเร็จ", "Unable to save post"),
        );
      setBlogs((current) =>
        draft.id
          ? current.map((post) => (post.id === draft.id ? body.data : post))
          : [body.data, ...current],
      );
      setDraft(null);
      notify(
        draft.id
          ? text("อัปเดตบทความแล้ว", "Post updated")
          : text("สร้างบทความแล้ว", "Post created"),
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : text("บันทึกบทความไม่สำเร็จ", "Unable to save post"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleteTarget?.id) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/blogs/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.message ?? text("ลบบทความไม่สำเร็จ", "Unable to delete post"),
        );
      setBlogs((current) =>
        current.filter((post) => post.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      notify(text("ลบบทความแล้ว", "Post deleted"));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : text("ลบบทความไม่สำเร็จ", "Unable to delete post"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      {toast && (
        <div className="fixed right-5 top-24 z-[80] rounded-xl bg-[#20201e] px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          ✓ {toast}
        </div>
      )}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-[#7d7d75]">
            {text(
              "เขียน เผยแพร่ และดูแลเนื้อหาบนเว็บไซต์",
              "Write, publish, and manage website content",
            )}
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            {text("จัดการบทความ", "Blog content management")}
          </h2>
        </div>
        <button
          onClick={() => {
            setError("");
            setDraft({ ...emptyDraft });
          }}
          className="rounded-xl bg-gradient-to-r from-[#d79639] to-[#ba6c22] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/15"
        >
          ＋ {text("เขียนบทความใหม่", "New post")}
        </button>
      </div>

      {error && !draft && (
        <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [text("บทความทั้งหมด", "All posts"), counts.all],
          [text("เผยแพร่แล้ว", "Published"), counts.published],
          [text("ฉบับร่าง", "Drafts"), counts.draft],
          [text("หมวดหมู่", "Categories"), counts.categories],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-black/6 bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#92928a]">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-black/6 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-black/6 p-4 sm:flex-row">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99998f]">
              ⌕
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text(
                "ค้นหาชื่อบทความ, slug หรือผู้เขียน...",
                "Search title, slug, or author...",
              )}
              className="w-full rounded-xl border border-black/8 bg-[#fafaf8] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#d28a31]"
            />
          </div>
          <BaseDropdown
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: text("ทุกสถานะ", "All statuses") },
              { value: "published", label: text("เผยแพร่แล้ว", "Published") },
              { value: "draft", label: text("ฉบับร่าง", "Draft") },
            ]}
            className="min-w-40"
          />
        </div>
        <div className="divide-y divide-black/5">
          {filtered.map((post) => (
            <article
              key={post.id ?? post.slug}
              className="flex flex-col gap-4 p-4 hover:bg-[#fcfbf8] sm:flex-row sm:items-center sm:p-5"
            >
              <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-[#eee9df] sm:h-20 sm:w-32">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center text-2xl">
                    ✎
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${post.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {post.published
                      ? text("เผยแพร่แล้ว", "Published")
                      : text("ฉบับร่าง", "Draft")}
                  </span>
                  <span className="text-xs font-semibold text-[#a16522]">
                    {post.category}
                  </span>
                </div>
                <h3 className="mt-2 truncate font-bold sm:text-lg">
                  {post.title}
                </h3>
                <p className="mt-1 truncate text-xs text-[#8a8a82]">
                  /{post.slug} · {post.author} ·{" "}
                  {displayDate(post.updatedAt ?? post.date)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {post.published && (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-black/8 px-3 py-2 text-xs font-semibold"
                  >
                    {text("ดูหน้าเว็บ", "View")}
                  </a>
                )}
                <button
                  onClick={() => {
                    setError("");
                    setDraft(toDraft(post));
                  }}
                  className="rounded-lg bg-[#20201e] px-4 py-2 text-xs font-semibold text-white"
                >
                  {text("แก้ไข", "Edit")}
                </button>
                <button
                  onClick={() => setDeleteTarget(post)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                >
                  {text("ลบ", "Delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && (
          <div className="py-20 text-center">
            <p className="text-4xl">✎</p>
            <p className="mt-3 font-semibold">
              {text("ไม่พบบทความ", "No posts found")}
            </p>
            <p className="mt-1 text-sm text-[#92928a]">
              {text(
                "เริ่มเขียนบทความใหม่ หรือเปลี่ยนตัวกรอง",
                "Create a new post or change the filter",
              )}
            </p>
          </div>
        )}
        <div className="border-t border-black/6 px-5 py-4 text-xs text-[#83837b]">
          {text(
            `แสดง ${filtered.length} จาก ${blogs.length} บทความ`,
            `Showing ${filtered.length} of ${blogs.length} posts`,
          )}
        </div>
      </section>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-6">
          <form
            onSubmit={save}
            className="max-h-[96vh] w-full max-w-6xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/6 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#b1742c]">
                  {text("ตัวแก้ไขเนื้อหา", "Content editor")}
                </p>
                <h3 className="text-xl font-bold">
                  {draft.id
                    ? text("แก้ไขบทความ", "Edit post")
                    : text("เขียนบทความใหม่", "Create new post")}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={draft.published}
                    onChange={(event) =>
                      field("published", event.target.checked)
                    }
                    className="h-5 w-5 accent-[#c98029]"
                  />
                  {text("เผยแพร่", "Publish")}
                </label>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2f2ef] text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1.7fr_1fr]">
              <div className="space-y-5">
                <Field label={text("ชื่อบทความ *", "Post title *")}>
                  <input
                    required
                    value={draft.title}
                    onChange={(event) => field("title", event.target.value)}
                    className="input-admin text-lg font-semibold"
                  />
                </Field>
                <Field label="Slug">
                  <input
                    value={draft.slug}
                    onChange={(event) => field("slug", event.target.value)}
                    placeholder="how-to-care-for-betta"
                    className="input-admin font-mono"
                  />
                </Field>
                <Field
                  label={text("คำโปรย", "Excerpt")}
                  hint={`${draft.excerpt.length}/300`}
                >
                  <textarea
                    maxLength={300}
                    rows={3}
                    value={draft.excerpt}
                    onChange={(event) => field("excerpt", event.target.value)}
                    className="input-admin resize-none"
                  />
                </Field>
                <Field
                  label={text(
                    "เนื้อหา (รองรับ Markdown) *",
                    "Content (Markdown supported) *",
                  )}
                  hint={draft.readTime}
                >
                  <textarea
                    required
                    rows={20}
                    value={draft.content}
                    onChange={(event) => updateReadTime(event.target.value)}
                    placeholder="## หัวข้อ..."
                    className="input-admin resize-y font-mono leading-6"
                  />
                </Field>
              </div>
              <div className="space-y-5">
                <Panel title={text("การเผยแพร่", "Publishing")}>
                  <Field label={text("หมวดหมู่ *", "Category *")}>
                    <BaseDropdown
                      value={draft.category}
                      onChange={(value) =>
                        field("category", value as BlogCategory)
                      }
                      options={categoryOptions.map((category) => ({
                        value: category,
                        label: category,
                      }))}
                    />
                  </Field>
                  <Field label={text("ผู้เขียน *", "Author *")}>
                    <input
                      required
                      value={draft.author}
                      onChange={(event) => field("author", event.target.value)}
                      className="input-admin"
                    />
                  </Field>
                  <Field label={text("เวลาอ่าน", "Read time")}>
                    <input
                      value={draft.readTime}
                      onChange={(event) =>
                        field("readTime", event.target.value)
                      }
                      className="input-admin"
                    />
                  </Field>
                  <Field
                    label={text(
                      "แท็ก (คั่นด้วย comma)",
                      "Tags (comma separated)",
                    )}
                  >
                    <input
                      value={draft.tags}
                      onChange={(event) => field("tags", event.target.value)}
                      placeholder="betta, care, beginner"
                      className="input-admin"
                    />
                  </Field>
                </Panel>
                <Panel title={text("รูปปก *", "Cover image *")}>
                  <label
                    className={`flex cursor-pointer justify-center rounded-xl border border-dashed border-[#d7b17d] bg-[#fffaf2] px-4 py-3 text-sm font-bold text-[#9c6226] ${uploading ? "pointer-events-none opacity-60" : ""}`}
                  >
                    {uploading
                      ? text("กำลังอัปโหลด...", "Uploading...")
                      : text("↑ อัปโหลดรูปปก", "↑ Upload cover")}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={uploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadCover(file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <Field label={text("หรือ URL รูปภาพ", "Or image URL")}>
                    <input
                      required
                      value={draft.coverImage}
                      onChange={(event) =>
                        field("coverImage", event.target.value)
                      }
                      className="input-admin text-xs"
                    />
                  </Field>
                  {draft.coverImage && (
                    <img
                      src={draft.coverImage}
                      alt="Cover preview"
                      className="h-40 w-full rounded-xl bg-[#f1eee8] object-cover"
                    />
                  )}
                </Panel>
                <Panel title="SEO">
                  <Field
                    label="Meta title"
                    hint={`${draft.seoTitle.length}/60`}
                  >
                    <input
                      maxLength={60}
                      value={draft.seoTitle}
                      onChange={(event) =>
                        field("seoTitle", event.target.value)
                      }
                      className="input-admin"
                    />
                  </Field>
                  <Field
                    label="Meta description"
                    hint={`${draft.seoDescription.length}/160`}
                  >
                    <textarea
                      maxLength={160}
                      rows={3}
                      value={draft.seoDescription}
                      onChange={(event) =>
                        field("seoDescription", event.target.value)
                      }
                      className="input-admin resize-none"
                    />
                  </Field>
                  <Field
                    label={text(
                      "บทความที่เกี่ยวข้อง (หนึ่ง slug ต่อบรรทัด)",
                      "Related posts (one slug per line)",
                    )}
                  >
                    <textarea
                      rows={3}
                      value={draft.relatedSlugs}
                      onChange={(event) =>
                        field("relatedSlugs", event.target.value)
                      }
                      className="input-admin resize-none font-mono text-xs"
                    />
                  </Field>
                </Panel>
              </div>
            </div>
            {error && (
              <p className="mx-5 mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 sm:mx-7">
                {error}
              </p>
            )}
            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-black/6 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-xl border border-black/10 px-5 py-3 text-sm font-semibold"
              >
                {text("ยกเลิก", "Cancel")}
              </button>
              <button
                disabled={saving || uploading}
                className="rounded-xl bg-[#20201e] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving
                  ? text("กำลังบันทึก...", "Saving...")
                  : draft.published
                    ? text("บันทึกและเผยแพร่", "Save & publish")
                    : text("บันทึกฉบับร่าง", "Save draft")}
              </button>
            </div>
          </form>
        </div>
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !saving && setDeleteTarget(null)}
        onConfirm={() => void remove()}
        title={text("ลบบทความหรือไม่?", "Delete this post?")}
        description={text(
          `บทความ “${deleteTarget?.title ?? ""}” จะถูกลบถาวรและไม่สามารถกู้คืนได้`,
          `“${deleteTarget?.title ?? ""}” will be permanently deleted and cannot be restored.`,
        )}
        variant="error"
        confirmText={
          saving
            ? text("กำลังลบ...", "Deleting...")
            : text("ลบบทความ", "Delete post")
        }
        cancelText={text("ยกเลิก", "Cancel")}
      />
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-xs font-semibold text-[#6f6f68]">
        <span>{label}</span>
        {hint && <span className="font-normal text-[#99998f]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-black/7 bg-[#fafaf8] p-4">
      <h4 className="font-bold">{title}</h4>
      {children}
    </section>
  );
}
