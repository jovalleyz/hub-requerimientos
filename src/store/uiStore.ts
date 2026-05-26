import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean; notificationsOpen: boolean; unreadCount: number; activeModal: string | null
  toggleSidebar: () => void; setSidebarOpen: (open: boolean) => void
  toggleNotifications: () => void; setUnreadCount: (count: number) => void
  openModal: (id: string) => void; closeModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false, notificationsOpen: false, unreadCount: 0, activeModal: null,
  toggleSidebar:       () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen:      (open) => set({ sidebarOpen: open }),
  toggleNotifications: () => set((s) => ({ notificationsOpen: !s.notificationsOpen })),
  setUnreadCount:      (count) => set({ unreadCount: count }),
  openModal:           (id) => set({ activeModal: id }),
  closeModal:          () => set({ activeModal: null }),
}))
