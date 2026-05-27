import { describe, it, expect, beforeEach } from "vitest"
import { useAuthStore } from "./authStore"
import type { User, Tenant } from "@/types"

const mockUser: User = {
  uid: "user-123", email: "test@example.com", displayName: "Test User",
  role: "MANAGER", tenantIds: ["tenant-1"], activeTenantId: "tenant-1",
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
}
const mockTenant: Tenant = {
  id: "tenant-1", name: "Seguros Universal", slug: "su", plan: "enterprise",
  isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  branding: { primaryColor: "#002169", secondaryColor: "#0058be", name: "Seguros Universal" },
}

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, activeTenant: null, isAuthenticated: false, isLoading: true })
  })
  it("has correct initial state", () => {
    const s = useAuthStore.getState()
    expect(s.user).toBeNull(); expect(s.isAuthenticated).toBe(false); expect(s.isLoading).toBe(true)
  })
  it("setUser authenticates the user", () => {
    useAuthStore.getState().setUser(mockUser)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
  it("setUser(null) marks as unauthenticated", () => {
    useAuthStore.getState().setUser(mockUser); useAuthStore.getState().setUser(null)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
  it("setActiveTenant stores tenant", () => {
    useAuthStore.getState().setActiveTenant(mockTenant)
    expect(useAuthStore.getState().activeTenant).toEqual(mockTenant)
  })
  it("setLoading updates loading flag", () => {
    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
  it("logout clears user, tenant and auth flag", () => {
    useAuthStore.getState().setUser(mockUser); useAuthStore.getState().setActiveTenant(mockTenant)
    useAuthStore.getState().logout()
    const s = useAuthStore.getState()
    expect(s.user).toBeNull(); expect(s.activeTenant).toBeNull(); expect(s.isAuthenticated).toBe(false)
  })
})
