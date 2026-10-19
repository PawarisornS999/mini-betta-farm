"use client";

import { createContext, useContext } from "react";
import type { Permission } from "@/lib/admin/permissions";

const AdminPermissionsContext = createContext<ReadonlySet<string>>(new Set());

export function AdminPermissionsProvider({
  permissions,
  children,
}: {
  permissions: string[];
  children: React.ReactNode;
}) {
  return (
    <AdminPermissionsContext.Provider value={new Set(permissions)}>
      {children}
    </AdminPermissionsContext.Provider>
  );
}

export function useAdminPermission(permission: Permission) {
  return useContext(AdminPermissionsContext).has(permission);
}
