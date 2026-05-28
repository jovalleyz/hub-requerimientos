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
    <div
      className="flex flex-col min-w-[300px] w-[300px] shrink-0 rounded-2xl"
      style={{
        background: "#ffffff",
        border: "1px solid var(--color-outline-variant)",
        boxShadow: "0 1px 4px rgba(11,28,48,0.06)",
      }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <span
          style={{
            width: 10, height: 10, borderRadius: "50%",
            background: meta.color, flexShrink: 0, display: "inline-block",
          }}
        />
        <span className="text-headline-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>
          {meta.label}
        </span>
        <span
          className="ml-auto text-label-sm px-2 py-0.5 rounded-full font-medium"
          style={{
            background: "var(--color-surface-container-high)",
            color: "var(--color-on-surface-variant)",
          }}
        >
          {requirements.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-3 flex-1 min-h-[120px] px-4 pb-4 transition-colors rounded-b-2xl"
        style={{
          background: isOver ? `color-mix(in srgb, ${meta.color} 8%, transparent)` : "transparent",
          outline: isOver ? `2px dashed ${meta.color}` : "none",
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
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              add_circle
            </span>
            <p className="text-body-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
              Arrastra aquí
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
