"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const body = await response.json();
        setError(body.message ?? "Login failed");
        setLoading(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7fa] px-4 py-10 text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-sky-100/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 h-96 w-96 rounded-full bg-cyan-100/60 blur-3xl" />
      <section className="relative w-full max-w-[420px] rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.22)] sm:p-10">
        <div className="mb-9 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-600 text-sm font-bold tracking-wide text-white shadow-sm shadow-sky-600/20">MB</div>
          <div>
            <p className="font-semibold tracking-tight">Mini Betta Farm</p>
            <p className="mt-0.5 text-xs text-slate-500">Admin Console</p>
          </div>
        </div>
        <p className="text-sm font-medium text-sky-700">ยินดีต้อนรับกลับ</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">เข้าสู่ระบบผู้ดูแล</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">ลงชื่อเข้าใช้เพื่อจัดการร้าน Mini Betta Farm</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">ชื่อผู้ใช้</span>
            <input
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">รหัสผ่าน</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
            />
          </label>
          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            disabled={loading || !username || !password}
            className="w-full rounded-xl bg-sky-600 px-5 py-3.5 font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
        <p className="mt-8 text-center text-xs text-slate-400">ระบบจัดการร้านค้า · Mini Betta Farm</p>
        <p className="mt-3 text-center text-xs"><Link className="text-sky-700 underline" href="/admin/setup">ตั้งค่า Owner ครั้งแรก</Link></p>
      </section>
    </main>
  );
}
