"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    if (!response.ok) { const body = await response.json(); setError(body.message ?? "Login failed"); setLoading(false); return; }
    router.replace("/admin"); router.refresh();
  }

  return (
    <main className="grid min-h-screen bg-[#171716] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#b06c27_0,transparent_35%),radial-gradient(circle_at_70%_70%,#654117_0,transparent_32%)] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/15 to-black/75" />
        <div className="relative flex h-full flex-col justify-between p-14 text-white"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d89131] text-2xl">🐟</div><div><p className="text-xs uppercase tracking-[.25em] text-[#dca95d]">Mini Betta Farm</p><p className="font-semibold">Admin Console</p></div></div><div className="max-w-lg"><p className="mb-5 text-sm font-medium uppercase tracking-[.2em] text-[#dca95d]">Premium Betta Commerce</p><h1 className="text-5xl font-semibold leading-tight">Care for every fish.<br />Control every detail.</h1><p className="mt-6 max-w-md text-lg leading-relaxed text-white/55">จัดการปลาแต่ละตัว สต็อก ราคา และสถานะการขายจากพื้นที่ทำงานเดียว</p></div><p className="text-xs text-white/30">Secure administration · Supabase powered</p></div>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12"><div className="w-full max-w-md"><div className="mb-10 lg:hidden"><span className="text-3xl">🐟</span><p className="mt-2 font-semibold text-white">Mini Betta Farm</p></div><p className="text-xs font-bold uppercase tracking-[.24em] text-[#d79235]">Welcome back</p><h2 className="mt-3 text-4xl font-semibold text-white">Admin sign in</h2><p className="mt-3 text-white/45">กรอกข้อมูลผู้ดูแลเพื่อจัดการสินค้าและสต็อก</p><form onSubmit={submit} className="mt-10 space-y-5"><label className="block"><span className="mb-2 block text-sm text-white/65">Username</span><input autoFocus value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/6 px-5 py-4 text-white outline-none transition focus:border-[#d79235] focus:bg-white/9" /></label><label className="block"><span className="mb-2 block text-sm text-white/65">Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/6 px-5 py-4 text-white outline-none transition focus:border-[#d79235] focus:bg-white/9" /></label>{error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}<button disabled={loading || !username || !password} className="w-full rounded-2xl bg-gradient-to-r from-[#e2a342] to-[#bd7225] px-5 py-4 font-bold text-white shadow-xl shadow-orange-950/30 transition hover:brightness-110 disabled:opacity-50">{loading ? "Signing in..." : "Sign in to dashboard"}</button></form></div></section>
    </main>
  );
}

