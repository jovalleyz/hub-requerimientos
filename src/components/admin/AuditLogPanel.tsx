import type { AuditEntry } from "@/services/adminService"
import { useAuditLog } from "@/hooks/useAdmin"

const ACTION_META: Record<string, { icon: string; color: string }> = {
  tenant_updated:   { icon: "edit",            color: "#0058be" },
  branding_updated: { icon: "palette",         color: "#7C3AED" },
  user_role_changed:{ icon: "manage_accounts", color: "#D97706" },
  user_invited:     { icon: "person_add",      color: "#1a7f1a" },
  user_removed:     { icon: "person_remove",   color: "#ba1a1a" },
  req_created:      { icon: "add_circle",      color: "#1a7f1a" },
  req_status:       { icon: "swap_horiz",      color: "#0058be" },
  project_created:  { icon: "account_tree",    color: "#7C3AED" },
  default:          { icon: "history",         color: "#44546f" },
}

function relative(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)     return "ahora"
  if (diff < 3600)   return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400)  return `hace ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" })
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const meta = ACTION_META[entry.action] ?? ACTION_META.default
  return (
    <div className="flex gap-3 pb-4">
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${meta.color} 15%, transparent)` }}
        >
          <span className="material-symbols-outlined text-[16px]" style={{ color: meta.color }}>
            {meta.icon}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-label-md font-semibold text-[var(--color-on-surface)]">{entry.actorName}</span>
          <span className="text-body-sm text-[var(--color-on-surface-variant)]">
            {entry.detail ?? entry.action.replace(/_/g, " ")}
          </span>
          {entry.target && (
            <span className="text-label-sm px-2 py-0.5 rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] font-mono">
              {entry.target}
            </span>
          )}
        </div>
        <p className="text-label-sm text-[var(--color-on-surface-variant)] opacity-70 mt-0.5">
          {relative(entry.createdAt)} · {new Date(entry.createdAt).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  )
}

export default function AuditLogPanel() {
  const { data: entries = [], isLoading } = useAuditLog()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5 py-1">
              <div className="h-4 w-64 bg-[var(--color-surface-container)] rounded-full animate-pulse" />
              <div className="h-3 w-24 bg-[var(--color-surface-container)] rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--color-on-surface-variant)]">
        <span className="material-symbols-outlined text-[40px] opacity-30 block mb-2">history_toggle_off</span>
        <p className="text-body-md">Sin actividad registrada aún</p>
        <p className="text-body-sm opacity-60 mt-1">Las acciones del panel generarán entradas aquí</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-4 bottom-0 w-px" style={{ background: "var(--color-outline-variant)" }} />
      <div className="max-h-[540px] overflow-y-auto pr-2">
        {entries.map(e => <AuditRow key={e.id} entry={e} />)}
      </div>
    </div>
  )
}
