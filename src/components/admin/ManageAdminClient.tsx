"use client";

import { useCallback, useEffect, useState } from "react";
import { PERMISSIONS } from "@/lib/admin/permissions";
import type { RoleRow, UserRow } from "@/lib/admin/manage";

const groups: Record<string, string> = { dashboard: "ภาพรวม", products: "สินค้า", inventory: "สต็อก", orders: "ออเดอร์", refunds: "คืนเงิน", payment: "บัญชีรับเงิน", categories: "หมวดหมู่", blogs: "บทความ", media: "รูปภาพ", admins: "ผู้ดูแล", roles: "Role" };
const actionNames: Record<string, string> = { view: "ดู", create: "เพิ่ม", edit: "แก้ไข", delete: "ลบ", adjust: "ปรับสต็อก", update: "อัปเดต", manage: "จัดการ", upload: "อัปโหลด" };
const inputClass = "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm";
const buttonClass = "rounded-xl bg-[#252522] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40";

export default function ManageAdminClient({ currentId }: { currentId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [tab, setTab] = useState<"users" | "roles">("users");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/manage", { cache: "no-store" });
    if (!response.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
    const data = await response.json();
    setUsers(data.users); setRoles(data.roles);
  }, []);
  useEffect(() => { const timer = setTimeout(() => { void load().catch(error => setMessage(error.message)); }, 0); return () => clearTimeout(timer); }, [load]);
  async function request(url: string, method: string, body?: object) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "บันทึกไม่สำเร็จ");
      await load(); setMessage("บันทึกเรียบร้อย");
      return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ"); return false; }
    finally { setBusy(false); }
  }
  async function addUser() {
    if (await request("/api/admin/manage/users", "POST", { username, password, isOwner, roleId })) { setUsername(""); setPassword(""); }
  }
  async function saveRole() {
    const ok = await request(editingRole ? `/api/admin/manage/roles/${editingRole}` : "/api/admin/manage/roles", editingRole ? "PATCH" : "POST", { name: roleName, permissions: selected });
    if (ok) { setEditingRole(null); setRoleName(""); setSelected([]); }
  }
  function editRole(role: RoleRow) { setEditingRole(role.id); setRoleName(role.name); setSelected(role.permissions); setTab("roles"); }
  async function changeUser(user: UserRow, body: object) {
    await request(`/api/admin/manage/users/${user.id}`, "PATCH", body);
  }
  return <div className="mx-auto max-w-6xl space-y-6">
    <div><h2 className="text-2xl font-bold">จัดการผู้ดูแลและสิทธิ์</h2><p className="mt-1 text-sm text-[#77776f]">Owner จัดการบัญชีและ Role ได้ สิทธิ์ใหม่มีผลกับคำขอถัดไป</p></div>
    <div className="flex gap-2 border-b border-black/10 pb-2"><button className={tab === "users" ? buttonClass : "px-4 py-2 text-sm"} onClick={() => setTab("users")}>ผู้ดูแล ({users.length})</button><button className={tab === "roles" ? buttonClass : "px-4 py-2 text-sm"} onClick={() => setTab("roles")}>Roles ({roles.length})</button></div>
    {message && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
    {tab === "users" ? <>
      <section className="rounded-2xl bg-white p-5 shadow-sm"><h3 className="mb-4 font-semibold">เพิ่มผู้ดูแล</h3><div className="grid gap-3 md:grid-cols-4"><input aria-label="ชื่อผู้ใช้" className={inputClass} placeholder="ชื่อผู้ใช้" value={username} onChange={e => setUsername(e.target.value)} /><input aria-label="รหัสผ่าน" type="password" className={inputClass} placeholder="รหัสผ่านอย่างน้อย 12 ตัวอักษร" value={password} onChange={e => setPassword(e.target.value)} /><select aria-label="Role" className={inputClass} value={isOwner ? "owner" : roleId} onChange={e => { setIsOwner(e.target.value === "owner"); setRoleId(e.target.value === "owner" ? "" : e.target.value); }}><option value="">เลือก Role</option><option value="owner">Owner</option>{roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select><button className={buttonClass} disabled={busy || !username || !password || (!isOwner && !roleId)} onClick={addUser}>เพิ่มผู้ดูแล</button></div></section>
      <section className="space-y-3">{users.map(user => <div key={user.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"><div className="min-w-48 flex-1"><p className="font-semibold">{user.username} {user.id === currentId && <span className="text-xs text-[#77776f]">(คุณ)</span>}</p><p className="text-xs text-[#77776f]">{user.is_owner ? "Owner" : roles.find(role => role.id === user.role_id)?.name ?? "ไม่พบ Role"} · {user.is_active ? "ใช้งาน" : "ปิดใช้งาน"} · เข้าล่าสุด {user.last_login_at ? new Date(user.last_login_at).toLocaleString("th-TH") : "ยังไม่เคย"}</p></div>{user.id !== currentId && <><select aria-label={`Role ของ ${user.username}`} className="rounded-xl border border-black/10 p-2 text-sm" value={user.is_owner ? "owner" : user.role_id ?? ""} disabled={busy} onChange={e => changeUser(user, e.target.value === "owner" ? { isOwner: true } : { isOwner: false, roleId: e.target.value })}><option value="owner">Owner</option>{roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select><button className="rounded-xl border border-black/10 px-3 py-2 text-sm" disabled={busy} onClick={() => { const value = prompt(`รหัสผ่านใหม่ของ ${user.username} (อย่างน้อย 12 ตัวอักษร)`); if (value) changeUser(user, { password: value }); }}>ตั้งรหัสผ่าน</button><button className="rounded-xl border border-black/10 px-3 py-2 text-sm" disabled={busy} onClick={() => { if (confirm(`${user.is_active ? "ปิด" : "เปิด"}บัญชี ${user.username}?`)) changeUser(user, { isActive: !user.is_active }); }}>{user.is_active ? "ปิดบัญชี" : "เปิดบัญชี"}</button></>}</div>)}</section>
    </> : <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]"><section className="space-y-3">{roles.map(role => <div key={role.id} className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm"><div className="flex-1"><p className="font-semibold">{role.name}</p><p className="text-xs text-[#77776f]">{role.permissions.length} สิทธิ์ · {users.filter(user => user.role_id === role.id).length} คน</p></div><button className="text-sm underline" onClick={() => editRole(role)}>แก้ไข</button>{!role.is_system && <button className="text-sm text-red-700 underline" disabled={busy} onClick={() => { if (confirm(`ลบ Role ${role.name}?`)) request(`/api/admin/manage/roles/${role.id}`, "DELETE"); }}>ลบ</button>}</div>)}</section><section className="rounded-2xl bg-white p-5 shadow-sm"><h3 className="font-semibold">{editingRole ? "แก้ไข Role" : "สร้าง Role"}</h3><input aria-label="ชื่อ Role" className={`${inputClass} mt-4`} placeholder="ชื่อ Role" value={roleName} onChange={e => setRoleName(e.target.value)} /><div className="mt-4 grid grid-cols-2 gap-2">{PERMISSIONS.map(permission => { const [group, action] = permission.split("."); const locked = group === "payment" || permission === "refunds.manage" || group === "admins" || group === "roles"; return <label key={permission} className={`flex items-center gap-2 rounded-lg border border-black/5 p-2 text-xs ${locked ? "opacity-45" : ""}`}><input type="checkbox" checked={selected.includes(permission)} disabled={locked} onChange={e => setSelected(e.target.checked ? [...selected, permission] : selected.filter(item => item !== permission))} />{groups[group]} · {actionNames[action]}</label>; })}</div><div className="mt-5 flex gap-2"><button className={buttonClass} disabled={busy || !roleName.trim()} onClick={saveRole}>บันทึก Role</button>{editingRole && <button className="px-3 text-sm" onClick={() => { setEditingRole(null); setRoleName(""); setSelected([]); }}>ยกเลิก</button>}</div></section></div>}
  </div>;
}
