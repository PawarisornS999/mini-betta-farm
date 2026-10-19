"use client";

import { useCallback, useEffect, useState } from "react";
import { PERMISSIONS } from "@/lib/admin/permissions";
import type { RoleRow, UserRow, CustomPermissionRow } from "@/lib/admin/manage";
import BaseDropdown from "@/components/BaseDropdown";
import Modal from "@/components/Modal";

type PendingAction =
  | { type: "password" | "status"; user: UserRow }
  | { type: "role"; user: UserRow; roleId: string }
  | { type: "deleteRole"; role: RoleRow }
  | { type: "deletePermission"; permission: CustomPermissionRow };

const groups: Record<string, string> = {
  dashboard: "ภาพรวม",
  products: "สินค้า",
  inventory: "สต็อก",
  orders: "ออเดอร์",
  refunds: "คืนเงิน",
  payment: "บัญชีรับเงิน",
  categories: "หมวดหมู่",
  blogs: "บทความ",
  media: "รูปภาพ",
  admins: "ผู้ดูแล",
  roles: "Role",
};
const actionNames: Record<string, string> = {
  view: "ดู",
  create: "เพิ่ม",
  edit: "แก้ไข",
  delete: "ลบ",
  adjust: "ปรับสต็อก",
  update: "อัปเดต",
  manage: "จัดการ",
  upload: "อัปโหลด",
};
const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm";
const buttonClass =
  "rounded-xl bg-[#252522] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40";

export default function ManageAdminClient({
  currentId,
}: {
  currentId: string;
}) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<CustomPermissionRow[]>([]);
  const [tab, setTab] = useState<"users" | "roles" | "permissions">("users");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [permissionKey, setPermissionKey] = useState("");
  const [permissionName, setPermissionName] = useState("");
  const [permissionDescription, setPermissionDescription] = useState("");
  const [grantsPermission, setGrantsPermission] = useState("");
  const [editingPermission, setEditingPermission] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const roleOptions = [
    { value: "owner", label: "Owner" },
    ...roles.map((role) => ({ value: role.id, label: role.name })),
  ];
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/manage", { cache: "no-store" });
    if (!response.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
    const data = await response.json();
    setUsers(data.users);
    setRoles(data.roles);
    setPermissions(data.permissions ?? []);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      void load().catch((error) => setMessage(error.message));
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);
  async function request(url: string, method: string, body?: object) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "บันทึกไม่สำเร็จ");
      await load();
      setMessage("บันทึกเรียบร้อย");
      return data;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function addUser() {
    if (
      await request("/api/admin/manage/users", "POST", {
        username,
        password,
        isOwner,
        roleId,
      })
    ) {
      setUsername("");
      setPassword("");
    }
  }
  async function saveRole() {
    const saved = await request(
      editingRole
        ? `/api/admin/manage/roles/${editingRole}`
        : "/api/admin/manage/roles",
      editingRole ? "PATCH" : "POST",
      { name: roleName, permissions: selected },
    );
    if (saved) {
      if (!editingRole && saved.role?.id) {
        setRoleId(saved.role.id);
        setIsOwner(false);
        setTab("users");
        setMessage(
          `สร้าง Role ${saved.role.name} แล้ว กรุณาเพิ่มบัญชีผู้ดูแลด้านล่าง`,
        );
      }
      setEditingRole(null);
      setRoleName("");
      setSelected([]);
    }
  }
  async function savePermission() {
    const ok = await request(
      editingPermission
        ? `/api/admin/manage/permissions/${editingPermission}`
        : "/api/admin/manage/permissions",
      editingPermission ? "PATCH" : "POST",
      {
        key: permissionKey,
        name: permissionName,
        description: permissionDescription,
        grantsPermission,
      },
    );
    if (ok) {
      setEditingPermission(null);
      setPermissionKey("");
      setPermissionName("");
      setPermissionDescription("");
      setGrantsPermission("");
    }
  }
  function editPermission(permission: CustomPermissionRow) {
    setEditingPermission(permission.id);
    setPermissionKey(permission.key.replace(/^custom\./, ""));
    setPermissionName(permission.name);
    setPermissionDescription(permission.description);
    setGrantsPermission(permission.grants_permission);
    setTab("permissions");
  }
  function prepareSellerRole() {
    setEditingRole(null);
    setRoleName("Seller");
    setSelected([
      "dashboard.view",
      "products.view",
      "products.create",
      "products.edit",
      "inventory.view",
      "inventory.adjust",
    ]);
    setTab("roles");
  }
  function editRole(role: RoleRow) {
    setEditingRole(role.id);
    setRoleName(role.name);
    setSelected(role.permissions);
    setTab("roles");
  }
  function closeModal() {
    if (busy) return;
    setPendingAction(null);
    setNewPassword("");
  }
  async function confirmPendingAction() {
    if (!pendingAction) return;
    let result: unknown;
    switch (pendingAction.type) {
      case "password":
        if (newPassword.length < 12 || newPassword.length > 128) return;
        result = await request(`/api/admin/manage/users/${pendingAction.user.id}`, "PATCH", { password: newPassword });
        break;
      case "status":
        result = await request(`/api/admin/manage/users/${pendingAction.user.id}`, "PATCH", { isActive: !pendingAction.user.is_active });
        break;
      case "role":
        result = await request(`/api/admin/manage/users/${pendingAction.user.id}`, "PATCH", pendingAction.roleId === "owner" ? { isOwner: true } : { isOwner: false, roleId: pendingAction.roleId });
        break;
      case "deleteRole":
        result = await request(`/api/admin/manage/roles/${pendingAction.role.id}`, "DELETE");
        break;
      case "deletePermission":
        result = await request(`/api/admin/manage/permissions/${pendingAction.permission.id}`, "DELETE");
        break;
    }
    if (result) {
      setPendingAction(null);
      setNewPassword("");
    }
  }
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">จัดการผู้ดูแลและสิทธิ์</h2>
        <p className="mt-1 text-sm text-[#77776f]">
          สร้าง Role เช่น Seller แล้วเพิ่มบัญชีผู้ดูแลเพื่อกำหนด Role ให้แต่ละคน
        </p>
      </div>
      <div className="rounded-2xl bg-white p-4 text-sm shadow-sm">
        <span className="font-semibold">วิธีเพิ่มผู้ดูแล:</span> 1. สร้าง Role
        และเลือกสิทธิ์ → 2. เพิ่มบัญชีผู้ดูแลแล้วเลือก Role นั้น{" "}
        <button
          className="ml-2 font-semibold text-[#a16522] underline"
          onClick={() => {
            setTab("roles");
            setEditingRole(null);
            setRoleName("");
            setSelected([]);
          }}
        >
          สร้าง Role ใหม่
        </button>
      </div>
      <div className="flex gap-2 border-b border-black/10 pb-2">
        <button
          className={tab === "users" ? buttonClass : "px-4 py-2 text-sm"}
          onClick={() => setTab("users")}
        >
          ผู้ดูแล ({users.length})
        </button>
        <button
          className={tab === "roles" ? buttonClass : "px-4 py-2 text-sm"}
          onClick={() => setTab("roles")}
        >
          Roles ({roles.length})
        </button>
        <button
          className={tab === "permissions" ? buttonClass : "px-4 py-2 text-sm"}
          onClick={() => setTab("permissions")}
        >
          Permissions ({PERMISSIONS.length + permissions.length})
        </button>
      </div>
      {message && (
        <p
          role="status"
          className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
        >
          {message}
        </p>
      )}
      {tab === "users" ? (
        <>
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-1 font-semibold">เพิ่มบัญชีผู้ดูแล</h3>
            <p className="mb-4 text-xs text-[#77776f]">
              สร้างชื่อผู้ใช้และรหัสผ่านให้แต่ละคน แล้วเลือก Role เช่น Admin
              หรือ Seller
            </p>
            <div className="grid gap-3 md:grid-cols-4">
              <input
                aria-label="ชื่อผู้ใช้"
                className={inputClass}
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                aria-label="รหัสผ่าน"
                type="password"
                className={inputClass}
                placeholder="รหัสผ่านอย่างน้อย 12 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <BaseDropdown
                ariaLabel="Role"
                placeholder="เลือก Role"
                className="w-full"
                options={roleOptions}
                value={isOwner ? "owner" : roleId}
                onChange={(value) => {
                  setIsOwner(value === "owner");
                  setRoleId(value === "owner" ? "" : value);
                }}
              />
              <button
                className={buttonClass}
                disabled={
                  busy || !username || !password || (!isOwner && !roleId)
                }
                onClick={addUser}
              >
                เพิ่มผู้ดูแล
              </button>
            </div>
            <button
              className="mt-3 text-xs font-semibold text-[#a16522] underline"
              onClick={() => setTab("roles")}
            >
              ยังไม่มี Role ที่ต้องการ? เพิ่ม Role ใหม่
            </button>
          </section>
          <section className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="min-w-48 flex-1">
                  <p className="font-semibold">
                    {user.username}{" "}
                    {user.id === currentId && (
                      <span className="text-xs text-[#77776f]">(คุณ)</span>
                    )}
                  </p>
                  <p className="text-xs text-[#77776f]">
                    {user.is_owner
                      ? "Owner"
                      : (roles.find((role) => role.id === user.role_id)?.name ??
                        "ไม่พบ Role")}{" "}
                    · {user.is_active ? "ใช้งาน" : "ปิดใช้งาน"} · เข้าล่าสุด{" "}
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleString("th-TH")
                      : "ยังไม่เคย"}
                  </p>
                </div>
                {user.id !== currentId && (
                  <>
                    <BaseDropdown
                      ariaLabel={`Role ของ ${user.username}`}
                      className="min-w-36"
                      options={roleOptions}
                      value={user.is_owner ? "owner" : (user.role_id ?? "")}
                      disabled={busy}
                      onChange={(value) =>
                        value && value !== (user.is_owner ? "owner" : user.role_id)
                          ? setPendingAction({ type: "role", user, roleId: value })
                          : undefined
                      }
                    />
                    <button
                      className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                      disabled={busy}
                      onClick={() => setPendingAction({ type: "password", user })}
                    >
                      ตั้งรหัสผ่าน
                    </button>
                    <button
                      className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                      disabled={busy}
                      onClick={() => setPendingAction({ type: "status", user })}
                    >
                      {user.is_active ? "ปิดบัญชี" : "เปิดบัญชี"}
                    </button>
                  </>
                )}
              </div>
            ))}
          </section>
        </>
      ) : tab === "roles" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <section className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex-1">
                  <p className="font-semibold">{role.name}</p>
                  <p className="text-xs text-[#77776f]">
                    {role.permissions.length} สิทธิ์ ·{" "}
                    {users.filter((user) => user.role_id === role.id).length} คน
                  </p>
                </div>
                <button
                  className="text-sm underline"
                  onClick={() => editRole(role)}
                >
                  แก้ไข
                </button>
                {!role.is_system && (
                  <button
                    className="text-sm text-red-700 underline"
                    disabled={busy}
                    onClick={() => setPendingAction({ type: "deleteRole", role })}
                  >
                    ลบ
                  </button>
                )}
              </div>
            ))}
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="font-semibold">
              {editingRole ? "แก้ไข Role" : "เพิ่ม Role ใหม่"}
            </h3>
            <p className="mt-1 text-xs text-[#77776f]">
              เช่น Seller: ตั้งชื่อ แล้วเลือกงานที่ทำได้
            </p>
            {!editingRole && (
              <button
                className="mt-3 rounded-lg border border-[#d89232] px-3 py-1.5 text-xs font-semibold text-[#a16522]"
                onClick={prepareSellerRole}
              >
                ใช้ตัวอย่าง Seller (สินค้าและสต็อก)
              </button>
            )}
            <input
              aria-label="ชื่อ Role"
              className={`${inputClass} mt-4`}
              placeholder="ชื่อ Role"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {PERMISSIONS.map((permission) => {
                const [group, action] = permission.split(".");
                const locked =
                  group === "payment" ||
                  permission === "refunds.manage" ||
                  group === "admins" ||
                  group === "roles";
                return (
                  <label
                    key={permission}
                    className={`flex items-center gap-2 rounded-lg border border-black/5 p-2 text-xs ${locked ? "opacity-45" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(permission)}
                      disabled={locked}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, permission]
                            : selected.filter((item) => item !== permission),
                        )
                      }
                    />
                    {groups[group]} · {actionNames[action]}
                  </label>
                );
              })}
            </div>
            <div className="mt-4 border-t border-black/10 pt-4">
              <p className="mb-2 text-sm font-semibold">
                Permission ที่เพิ่มเอง
              </p>
              <div className="grid grid-cols-2 gap-2">
                {permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-center gap-2 rounded-lg border border-black/5 p-2 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(permission.key)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, permission.key]
                            : selected.filter(
                                (item) => item !== permission.key,
                              ),
                        )
                      }
                    />
                    {permission.name}{" "}
                    <span className="text-[#77776f]">
                      ({permission.grants_permission})
                    </span>
                  </label>
                ))}
              </div>
              {!permissions.length && (
                <p className="text-xs text-[#77776f]">
                  เพิ่มได้ที่แท็บ Permissions
                </p>
              )}
            </div>
            <div className="mt-5 flex gap-2">
              <button
                className={buttonClass}
                disabled={busy || !roleName.trim()}
                onClick={saveRole}
              >
                บันทึก Role
              </button>
              {editingRole && (
                <button
                  className="px-3 text-sm"
                  onClick={() => {
                    setEditingRole(null);
                    setRoleName("");
                    setSelected([]);
                  }}
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <section className="space-y-3">
            <h3 className="font-semibold">Permission ที่เพิ่มเอง</h3>
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{permission.name}</p>
                  <p className="break-all text-xs text-[#77776f]">
                    {permission.key} → {permission.grants_permission}
                  </p>
                  {permission.description && (
                    <p className="mt-1 text-xs text-[#77776f]">
                      {permission.description}
                    </p>
                  )}
                </div>
                <button
                  className="text-sm underline"
                  onClick={() => editPermission(permission)}
                >
                  แก้ไข
                </button>
                <button
                  className="text-sm text-red-700 underline"
                  disabled={busy}
                  onClick={() => setPendingAction({ type: "deletePermission", permission })}
                >
                  ลบ
                </button>
              </div>
            ))}
            {!permissions.length && (
              <p className="rounded-2xl bg-white p-4 text-sm text-[#77776f]">
                ยังไม่มี Permission ที่เพิ่มเอง
              </p>
            )}
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="font-semibold">
              {editingPermission ? "แก้ไข Permission" : "เพิ่ม Permission"}
            </h3>
            <p className="mt-2 text-xs text-[#77776f]">
              Permission ใหม่นี้จะให้สิทธิ์เทียบเท่าการกระทำที่เลือก
              และใช้ร่วมกับสิทธิ์พื้นฐานของ Role ได้
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                รหัส Permission
                <div className="mt-1 flex items-center rounded-xl border border-black/10">
                  <span className="pl-3 text-[#77776f]">custom.</span>
                  <input
                    aria-label="รหัส Permission"
                    className="w-full p-2 outline-none"
                    placeholder="manage_stock"
                    value={permissionKey}
                    disabled={!!editingPermission}
                    onChange={(e) => setPermissionKey(e.target.value)}
                  />
                </div>
              </label>
              <label className="block text-sm">
                ชื่อที่แสดง
                <input
                  className={`${inputClass} mt-1`}
                  value={permissionName}
                  onChange={(e) => setPermissionName(e.target.value)}
                  placeholder="จัดการสต็อก"
                />
              </label>
              <label className="block text-sm">
                คำอธิบาย
                <input
                  className={`${inputClass} mt-1`}
                  value={permissionDescription}
                  onChange={(e) => setPermissionDescription(e.target.value)}
                />
              </label>
              <div className="block text-sm">
                <BaseDropdown
                  label="สิทธิ์การกระทำที่มอบ"
                  ariaLabel="สิทธิ์การกระทำที่มอบ"
                  placeholder="เลือกสิทธิ์"
                  className="mt-1"
                  value={grantsPermission}
                  onChange={setGrantsPermission}
                  options={PERMISSIONS.filter(
                    (item) =>
                      ![
                        "payment.view",
                        "payment.edit",
                        "refunds.manage",
                        "admins.manage",
                        "roles.manage",
                      ].includes(item),
                  ).map((item) => ({ value: item, label: item }))}
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                className={buttonClass}
                disabled={
                  busy ||
                  !permissionName.trim() ||
                  !grantsPermission ||
                  (!editingPermission && !permissionKey.trim())
                }
                onClick={savePermission}
              >
                บันทึก Permission
              </button>
              {editingPermission && (
                <button
                  className="px-3 text-sm"
                  onClick={() => {
                    setEditingPermission(null);
                    setPermissionKey("");
                    setPermissionName("");
                    setPermissionDescription("");
                    setGrantsPermission("");
                  }}
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </section>
        </div>
      )}
      <Modal
        isOpen={pendingAction !== null}
        onClose={closeModal}
        onConfirm={() => void confirmPendingAction()}
        title={
          pendingAction?.type === "password"
            ? `ตั้งรหัสผ่านใหม่ของ ${pendingAction.user.username}`
            : pendingAction?.type === "status"
              ? `${pendingAction.user.is_active ? "ปิด" : "เปิด"}บัญชี ${pendingAction.user.username}?`
              : pendingAction?.type === "role"
                ? `เปลี่ยน Role ของ ${pendingAction.user.username}?`
                : pendingAction?.type === "deleteRole"
                  ? `ลบ Role ${pendingAction.role.name}?`
                  : pendingAction?.type === "deletePermission"
                    ? `ลบ Permission ${pendingAction.permission.name}?`
                    : "ยืนยันการเปลี่ยนแปลง"
        }
        description={
          pendingAction?.type === "role"
            ? `Role ใหม่: ${pendingAction.roleId === "owner" ? "Owner" : roles.find((role) => role.id === pendingAction.roleId)?.name ?? "ไม่พบ Role"}`
            : pendingAction?.type === "deleteRole"
              ? "ลบได้เมื่อไม่มีบัญชีใช้งาน Role นี้"
              : pendingAction?.type === "deletePermission"
                ? "ลบได้เมื่อไม่มี Role ใช้งาน Permission นี้"
                : undefined
        }
        variant={pendingAction?.type === "password" || pendingAction?.type === "role" ? "warning" : "error"}
        confirmText={busy ? "กำลังบันทึก..." : "ยืนยัน"}
        cancelText="ยกเลิก"
        confirmDisabled={busy || (pendingAction?.type === "password" && (newPassword.length < 12 || newPassword.length > 128))}
      >
        {pendingAction?.type === "password" && (
          <label className="block text-sm font-medium">
            รหัสผ่านใหม่ (12–128 ตัวอักษร)
            <input
              type="password"
              autoComplete="new-password"
              className={`${inputClass} mt-2`}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>
        )}
      </Modal>
    </div>
  );
}
