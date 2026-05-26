import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Tenant } from '../types/index'

interface AuthState {
  user: User | null; activeTenant: Tenant | null
  isAuthenticated: boolean; isLoading: boolean
  setUser: (user: User | null) => void
  setActiveTenant: (tenant: Tenant | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, activeTenant: null, isAuthenticated: false, isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setActiveTenant: (activeTenant) => set({ activeTenant }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, activeTenant: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, activeTenant: s.activeTenant }) }
  )
)
