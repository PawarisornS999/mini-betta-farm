"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { adminText, useAdminLanguage } from "./LanguageProvider";
import Modal from "../Modal";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: "◫" },
  { href: "/admin/products", label: "Products", icon: "◆" },
  { href: "/admin/orders", label: "Orders", icon: "▤" },
  { href: "/admin/payment-settings", label: "Payment", icon: "฿" },
  { href: "/admin/categories", label: "Categories", icon: "◇" },
  { href: "/admin/inventory", label: "Inventory", icon: "▦" },
];

export default function AdminShell({ username, children }: { username: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { language, setLanguage } = useAdminLanguage();
  const text = (th: string, en: string) => adminText(language, th, en);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      setConfirmLogout(false);
      setLoggingOut(false);
    }
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f6f6f3] text-[#252522]">
      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/45 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#191918] text-white transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#e5a63b] to-[#bd6f21] text-xl shadow-lg shadow-orange-950/30">🐟</div>
          <div><p className="text-[11px] uppercase tracking-[.24em] text-[#dca24a]">Mini Betta Farm</p><p className="font-semibold">Admin Console</p></div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.22em] text-white/35">{text("จัดการร้าน", "Management")}</p>
          {navigation.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const label = item.label === "Dashboard" ? text("ภาพรวม", "Dashboard") : item.label === "Products" ? text("สินค้า", "Products") : item.label === "Orders" ? text("ออเดอร์", "Orders") : item.label === "Payment" ? text("บัญชีรับเงิน", "Payment") : item.label === "Categories" ? text("หมวดหมู่", "Categories") : text("สต็อก", "Inventory");
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${active ? "bg-[#d89232] text-white shadow-lg shadow-orange-950/20" : "text-white/65 hover:bg-white/7 hover:text-white"}`}><span className="w-5 text-center text-base">{item.icon}</span>{label}</Link>;
          })}
          <div className="my-5 border-t border-white/10" />
          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/55 hover:bg-white/7 hover:text-white"><span className="w-5 text-center">↗</span>{text("ดูหน้าร้าน", "View storefront")}</Link>
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6b565] font-bold text-[#2d2114]">{username.slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{username}</p><p className="text-xs text-white/40">ผู้ดูแลระบบสูงสุด</p></div>
            <button onClick={() => setConfirmLogout(true)} title={text("ออกจากระบบ", "Logout")} className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white">↪</button>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-black/6 bg-[#f6f6f3]/90 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-4"><button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 bg-white lg:hidden">☰</button><div><p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#a16522]">{text("จัดการร้านค้า", "Store management")}</p><h1 className="text-lg font-bold">{pathname.includes("inventory") ? text("สต็อก", "Inventory") : pathname.includes("orders") ? text("ออเดอร์", "Orders") : pathname.includes("products") ? text("สินค้า", "Products") : text("ภาพรวม", "Dashboard")}</h1></div></div>
          <div className="flex items-center gap-3"><div className="hidden rounded-xl border border-black/8 bg-white px-4 py-2 text-xs text-[#77776f] sm:block">⌘ K &nbsp; {text("ค้นหา", "Search")}</div><div className="flex items-center rounded-xl border border-black/8 bg-white p-1 text-xs font-bold"><button onClick={() => setLanguage("th")} className={`rounded-lg px-2 py-1 ${language === "th" ? "bg-[#20201e] text-white" : "text-[#77776f]"}`}>ไทย</button><button onClick={() => setLanguage("en")} className={`rounded-lg px-2 py-1 ${language === "en" ? "bg-[#20201e] text-white" : "text-[#77776f]"}`}>EN</button></div><button className="grid h-10 w-10 place-items-center rounded-xl border border-black/8 bg-white">●</button></div>
        </header>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
      <Modal
        isOpen={confirmLogout}
        onClose={() => !loggingOut && setConfirmLogout(false)}
        onConfirm={() => void logout()}
        title={text("ออกจากระบบหรือไม่?", "Log out?")}
        description={text("คุณต้องการออกจากระบบผู้ดูแลใช่หรือไม่", "Are you sure you want to log out of the admin panel?")}
        variant="warning"
        confirmText={loggingOut ? text("กำลังออกจากระบบ...", "Logging out...") : text("ออกจากระบบ", "Log out")}
        cancelText={text("ยกเลิก", "Cancel")}
      />
    </div>
  );
}
