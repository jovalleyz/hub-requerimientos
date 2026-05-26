import { useEffect, useRef } from "react"
import type { Notification } from "@/types"
import { useUiStore }       from "@/store/uiStore"
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications"

const TYPE_META: Record<string, { icon: string; color: string }> = {
  requirement_created:  { icon: "add_circle",   color: "#1a7f1a" },
  status_changed:       { icon: "swap_horiz",   color: "#0058be" },
  task_assigned:        { icon: "assignment",   color: "#7C3AED" },
  deadline_warning:     { icon: "alarm",        color: "#D97706" },
  comment_added:        { icon: "chat_bubble",  color: "#0058be" },
  document_uploaded:    { icon: "attach_file",  color: "#44546f" },
  default:              { icon: "notifications",color: "#44546f" },
}

function relative(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return "ahora"
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

function NotifItem({ n, onRead }: { n: Notification; onRead: (id: string) => void }) {
  const meta = TYPE_META[n.type] ?? TYPE_META.default
  return (
    <button
      onClick={() => !n.isRead && onRead(n.id)}
      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-container-low)]"
      style={{ background: n.isRead ? "transparent" : "color-mix(in srgb, var(--color-primary) 5%, transparent)" }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `color-mix(in srgb, ${meta.color} 15%, transparent)` }}
      >
        <span className="material-symbols-outlined text-[18px]" style={{ color: meta.color }}>
          {meta.icon}
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-body-md leading-snug"
          style={{
            color: "var(--color-on-surface)",
            fontWeight: n.isRead ? 400 : 600,
          }}
        >
          {n.title}
        </p>
        <p className="text-body-sm text-[var(--color-on-surface-variant)] mt-0.5 leading-snug">
          {n.message}
        </p>
        <p className="text-label-sm text-[var(--color-on-surface-variant)] mt-1 opacity-70">
          {relative(n.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {!n.isRead && (
        <div
          className="w-2 h-2 rounded-full shrink-0 mt-2"
          style={{ background: "var(--color-primary)" }}
        />
      )}
    </button>
  )
}

export default function NotificationDrawer() {
  const { notificationsOpen, toggleNotifications } = useUiStore()
  const { data: notifications = [] } = useNotifications()
  const markRead    = useMarkAsRead()
  const markAllRead = useMarkAllAsRead()
  const drawerRef   = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.isRead).length

  // Close on Escape
  useEffect(() => {
    if (!notificationsOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") toggleNotifications() }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [notificationsOpen, toggleNotifications])

  if (!notificationsOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={toggleNotifications}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-sm bg-[var(--color-surface)] shadow-2xl animate-slide-up"
        style={{ animation: "slideRight 0.22s ease" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-outline-variant)] shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[var(--color-primary)]">
              notifications
            </span>
            <h2 className="text-title-md text-[var(--color-on-surface)] font-semibold">
              Notificaciones
            </h2>
            {unread > 0 && (
              <span
                className="text-label-sm px-2 py-0.5 rounded-full text-white font-bold"
                style={{ background: "var(--color-error)" }}
              >
                {unread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-label-sm text-[var(--color-primary)] px-3 py-1.5 rounded-full hover:bg-[var(--color-surface-container)] transition-colors"
              >
                Marcar todo leído
              </button>
            )}
            <button
              onClick={toggleNotifications}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-container)] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-[var(--color-on-surface-variant)]">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--color-on-surface-variant)]">
              <span className="material-symbols-outlined text-[48px] opacity-30">notifications_off</span>
              <p className="text-body-md">Sin notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-outline-variant)]">
              {notifications.map(n => (
                <NotifItem
                  key={n.id}
                  n={n}
                  onRead={id => markRead.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--color-outline-variant)] shrink-0">
          <p className="text-label-sm text-[var(--color-on-surface-variant)] text-center">
            {notifications.length} notificación{notifications.length !== 1 ? "es" : ""} · últimas 30
          </p>
        </div>
      </div>
    </>
  )
}
