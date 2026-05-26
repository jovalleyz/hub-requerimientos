import { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"
import { useUiStore }   from "@/store/uiStore"
import {
  getNotifications, markAsRead, markAllAsRead, subscribeNotifications,
} from "@/services/notificationsService"

export function useNotifications() {
  const { user } = useAuthStore()
  const { setUnreadCount } = useUiStore()
  const userId = user?.uid ?? ""
  const qc = useQueryClient()

  // Real-time listener keeps cache fresh
  useEffect(() => {
    if (!userId) return
    const unsub = subscribeNotifications(userId, (items) => {
      qc.setQueryData(["notifications", userId], items)
      setUnreadCount(items.filter(n => !n.isRead).length)
    })
    return unsub
  }, [userId, qc, setUnreadCount])

  return useQuery({
    queryKey: ["notifications", userId],
    queryFn:  () => getNotifications(userId),
    enabled:  !!userId,
    staleTime: Infinity, // kept fresh by listener
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const userId = user?.uid ?? ""
  return useMutation({
    mutationFn: (notifId: string) => markAsRead(userId, notifId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const userId = user?.uid ?? ""
  return useMutation({
    mutationFn: () => markAllAsRead(userId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  })
}
