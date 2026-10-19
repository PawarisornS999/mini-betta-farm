"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupOwnerForm() {
  const router = useRouter();
  const [setupToken, setSetupToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) { setMessage("รหัสผ่านทั้งสองช่องไม่ตรงกัน"); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ setupToken, username, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "ตั้งค่าไม่สำเร็จ");
      router.replace("/admin/manage"); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "ตั้งค่าไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-[#f5f7fa] px-4 py-10 text-slate-900"><section className="w-full max-w-[440px] rounded-3xl bg-white p-8 shadow-xl"><p className="text-sm font-semibold text-sky-700">Mini Betta Farm · Admin Console</p><h1 className="mt-2 text-2xl font-bold">ตั้งค่าบัญชี Owner</h1><p className="mt-2 text-sm text-slate-600">ใช้รหัสตั้งค่าครั้งเดียว แล้วกำหนดชื่อผู้ใช้และรหัสผ่านของ Owner บัญชีเดิมจะถูกเปลี่ยนเป็นข้อมูลนี้หากมีอยู่</p><form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-medium">รหัสตั้งค่าครั้งเดียว<input className="mt-1 w-full rounded-xl border border-slate-200 p-3" type="password" autoComplete="off" required value={setupToken} onChange={event => setSetupToken(event.target.value)} /></label><label className="block text-sm font-medium">ชื่อผู้ใช้<input className="mt-1 w-full rounded-xl border border-slate-200 p-3" autoComplete="username" required minLength={3} maxLength={40} value={username} onChange={event => setUsername(event.target.value)} /></label><label className="block text-sm font-medium">รหัสผ่านใหม่<input className="mt-1 w-full rounded-xl border border-slate-200 p-3" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} /></label><label className="block text-sm font-medium">ยืนยันรหัสผ่าน<input className="mt-1 w-full rounded-xl border border-slate-200 p-3" type="password" autoComplete="new-password" required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></label>{message && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}<button disabled={busy} className="w-full rounded-xl bg-sky-600 p-3 font-semibold text-white disabled:opacity-50">{busy ? "กำลังสร้าง..." : "สร้าง Owner"}</button></form></section></main>;
}
