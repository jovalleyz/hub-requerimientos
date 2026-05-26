import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"
import {
  getTenant, updateTenant, createTenant,
  uploadTenantLogo, saveBranding,
  getTenantUsers, updateUserRole,
  getAuditLog,
} from "@/services/adminService"
import type { Tenant, UserRole, TenantBranding } from "@/types"

// ─── Tenant ───────────────────────────────────────────────────────────────────

export function useAdminTenant() {
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useQuery({
    queryKey: ["admin-tenant", tenantId],
    queryFn:  () => getTenant(tenantId),
    enabled:  !!tenantId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateTenant() {
  const qc = useQueryClient()
  const { activeTenant, setActiveTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: (data: Partial<Omit<Tenant, "id" | "createdAt">>) =>
      updateTenant(tenantId, data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-tenant", tenantId] })
      // Refresh activeTenant in store
      const fresh = await getTenant(tenantId)
      if (fresh) setActiveTenant(fresh)
    },
  })
}

export function useCreateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Tenant, "id" | "createdAt" | "updatedAt">) =>
      createTenant(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tenant"] }),
  })
}

// ─── Branding ─────────────────────────────────────────────────────────────────

export function useUploadLogo() {
  const qc = useQueryClient()
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      uploadTenantLogo(tenantId, file, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tenant", tenantId] }),
  })
}

export function useSaveBranding() {
  const qc = useQueryClient()
  const { activeTenant, setActiveTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: (branding: Partial<TenantBranding>) => saveBranding(tenantId, branding),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-tenant", tenantId] })
      const fresh = await getTenant(tenantId)
      if (fresh) setActiveTenant(fresh)
    },
  })
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function useTenantUsers() {
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useQuery({
    queryKey: ["tenant-users", tenantId],
    queryFn:  () => getTenantUsers(tenantId),
    enabled:  !!tenantId,
  })
}

export function useUpdateUserRole() {
  const qc = useQueryClient()
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: UserRole }) =>
      updateUserRole(uid, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenant-users", tenantId] }),
  })
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export function useAuditLog() {
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useQuery({
    queryKey: ["audit-log", tenantId],
    queryFn:  () => getAuditLog(tenantId),
    enabled:  !!tenantId,
    staleTime: 1000 * 60,
  })
}
