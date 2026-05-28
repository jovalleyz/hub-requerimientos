import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean; notificationsOpen: boolean; unreadCount: number; activeModal: string | null
  searchQuery: string; searchOpen: boolean
  toggleSidebar: () => void; setSidebarOpen: (open: boolean) => void
  toggleNotifications: () => void; setUnreadCount: (count: number) => void
  openModal: (id: string) => void; closeModal: () => void
  setSearchQuery: (q: string) => void; setSearchOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false, notificationsOpen: false, unreadCount: 0, activeModal: null,
  searchQuery: '', searchOpen: false,
  toggleSidebar:       () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen:      (open) => set({ sidebarOpen: open }),
  toggleNotifications: () => set((s) => ({ notificationsOpen: !s.notificationsOpen })),
  setUnreadCount:      (count) => set({ unreadCount: count }),
  openModal:           (id) => set({ activeModal: id }),
  closeModal:          () => set({ activeModal: null }),
  setSearchQuery:      (searchQuery) => set({ searchQuery }),
  setSearchOpen:       (searchOpen) => set({ searchOpen }),
}))
