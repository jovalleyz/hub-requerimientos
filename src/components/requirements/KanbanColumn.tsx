import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { Requirement, RequirementStatus } from "@/types"
import RequirementCard from "./RequirementCard"

const STATUS_META: Record<RequirementStatus, { label: string; color: string; icon: string }> = {
  BACKLOG:     { label: "Backlog",      color: "var(--color-outline)",   icon: "inbox" },
  ANALYSIS:    { label: "Análisis",    color: "#7C3AED",                icon: "manage_search" },
  IN_PROGRESS: { label: "En Progreso", color: "var(--color-secondary)", icon: "pending" },
  REVIEW:      { label: "Revisión",    color: "#D97706",                icon: "rate_review" },
  COMPLETED:   { label: "Completado",  color: "var(--color-success)",   icon: "task_alt" },
  CANCELLED:   { label: "Cancelado",   color: "var(--color-error)",     icon: "cancel" },
}

interface KanbanColumnProps {
  status: RequirementStatus
  requirements: Requirement[]
  onCardClick: (r: Requirement) => void
}

export default function KanbanColumn({ status, requirements, onCardClick }: KanbanColumnProps) {
  const meta = STATUS_META[status]
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col min-w-[300px] w-[300px] shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="material-symbols-outlined text-[18px]" style={{ color: meta.color }}>
          {meta.icon}
        </span>
        <span className="text-label-lg text-[var(--color-on-surface)] font-semibold">
          {meta.label}
        </span>
        <span
          className="ml-auto text-label-sm px-2 py-0.5 rounded-full font-medium"
          style={{
            background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
            color: meta.color,
          }}
        >
          {requirements.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-3 flex-1 min-h-[120px] rounded-2xl p-2 transition-colors"
        style={{
          background: isOver ? `color-mix(in srgb, ${meta.color} 8%, transparent)` : "transparent",
          outline: isOver ? `2px dashed ${meta.color}` : "2px dashed transparent",
        }}
      >
        <SortableContext
          items={requirements.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          {requirements.map((req) => (
            <RequirementCard key={req.id} requirement={req} onClick={onCardClick} />
          ))}
        </SortableContext>

        {requirements.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center h-24 opacity-30 select-none">
            <span className="material-symbols-outlined text-[28px] text-[var(--color-outline)]">
              add_circle
            </span>
            <p className="text-body-sm text-[var(--color-on-surface-variant)] mt-1">Arrastra aquí</p>
          </div>
        )}
      </div>
    </div>
  )
}
