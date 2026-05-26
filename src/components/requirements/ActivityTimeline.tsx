import type { ActivityEntry } from "@/types"
import { useActivity } from "@/hooks/useRequirementDetail"

const ACTION_META: Record<string, { icon: string; color: string; label: (m?: Record<string, unknown>) => string }> = {
  created:         { icon: "add_circle",    color: "#1a7f1a", label: () => "creó el requerimiento" },
  status_changed:  { icon: "swap_horiz",    color: "#0058be", label: m => `cambió estado a ${m?.to ?? ""}` },
  priority_changed:{ icon: "flag",          color: "#D97706", label: m => `cambió prioridad a ${m?.to ?? ""}` },
  task_added:      { icon: "add_task",      color: "#7C3AED", label: m => `agregó tarea "${m?.title ?? ""}"` },
  task_completed:  { icon: "task_alt",      color: "#1a7f1a", label: m => `completó "${m?.title ?? ""}"` },
  note_added:      { icon: "chat_bubble",   color: "#0058be", label: () => "añadió una nota" },
  document_added:  { icon: "attach_file",   color: "#44546f", label: m => `adjuntó "${m?.name ?? ""}"` },
  assigned:        { icon: "person_add",    color: "#7C3AED", label: m => `asignó a ${m?.name ?? ""}` },
}

function TimelineEntry({ entry }: { entry: ActivityEntry }) {
  const meta = ACTION_META[entry.action] ?? {
    icon: "info", color: "#44546f",
    label: () => entry.action,
  }
  const date = new Date(entry.createdAt)
  const dateStr = date.toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" })
  const timeStr = date.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="flex gap-3">
      {/* Icon dot */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${meta.color} 15%, transparent)` }}
        >
          <span className="material-symbols-outlined text-[16px]" style={{ color: meta.color }}>
            {meta.icon}
          </span>
        </div>
        {/* Connecting line — rendered by CSS via parent */}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-label-md font-semibold text-[var(--color-on-surface)]">
            {entry.actorName}
          </span>
          <span className="text-body-sm text-[var(--color-on-surface-variant)]">
            {meta.label(entry.metadata)}
          </span>
        </div>
        <p className="text-label-sm text-[var(--color-on-surface-variant)] mt-0.5">
          {dateStr} · {timeStr}
        </p>
      </div>
    </div>
  )
}

interface Props { reqId: string }

export default function ActivityTimeline({ reqId }: Props) {
  const { data: entries = [], isLoading } = useActivity(reqId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5 py-1">
              <div className="h-4 w-48 bg-[var(--color-surface-container)] rounded-full animate-pulse" />
              <div className="h-3 w-24 bg-[var(--color-surface-container)] rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 text-[var(--color-on-surface-variant)]">
        <span className="material-symbols-outlined text-[40px] opacity-30 block mb-2">history</span>
        <p className="text-body-md">Sin actividad registrada</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div
        className="absolute left-4 top-4 bottom-0 w-px"
        style={{ background: "var(--color-outline-variant)" }}
      />
      <div className="space-y-0">
        {entries.map(e => <TimelineEntry key={e.id} entry={e} />)}
      </div>
    </div>
  )
}
