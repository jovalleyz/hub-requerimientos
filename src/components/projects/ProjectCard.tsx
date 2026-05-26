import type { Project } from "@/types"

const STATUS_META = {
  active:     { label: "Activo",      color: "#1a7f1a", bg: "#dcfce7", icon: "play_circle" },
  completed:  { label: "Completado",  color: "#0058be", bg: "#dce9ff", icon: "task_alt"    },
  on_hold:    { label: "En pausa",    color: "#D97706", bg: "#fef3c7", icon: "pause_circle" },
  cancelled:  { label: "Cancelado",   color: "#ba1a1a", bg: "#ffdad6", icon: "cancel"      },
} satisfies Record<Project["status"], { label: string; color: string; bg: string; icon: string }>

interface Props {
  project:  Project
  onEdit:   (p: Project) => void
  onDelete: (p: Project) => void
  onSelect: (p: Project) => void
  selected: boolean
}

function phaseProgress(project: Project): number {
  if (!project.phases.length) return 0
  return Math.round(project.phases.reduce((s, p) => s + p.progress, 0) / project.phases.length)
}

export default function ProjectCard({ project: p, onEdit, onDelete, onSelect, selected }: Props) {
  const meta    = STATUS_META[p.status]
  const overall = phaseProgress(p)
  const phases  = p.phases.length

  return (
    <div
      onClick={() => onSelect(p)}
      className="tonal-card p-5 cursor-pointer transition-all hover:shadow-lg"
      style={{
        outline: selected ? `2px solid var(--color-primary)` : "2px solid transparent",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-title-md text-[var(--color-on-surface)] font-semibold leading-snug truncate">
            {p.name}
          </h3>
          {p.description && (
            <p className="text-body-sm text-[var(--color-on-surface-variant)] mt-0.5 line-clamp-2">
              {p.description}
            </p>
          )}
        </div>
        {/* Status badge */}
        <span
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-semibold shrink-0"
          style={{ background: meta.bg, color: meta.color }}
        >
          <span className="material-symbols-outlined text-[13px]">{meta.icon}</span>
          {meta.label}
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-label-sm text-[var(--color-on-surface-variant)] mb-1">
          <span>{phases} fase{phases !== 1 ? "s" : ""}</span>
          <span className="font-semibold">{overall}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--color-surface-container)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overall}%`,
              background: overall === 100 ? "var(--color-success)" : "var(--color-secondary)",
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-label-sm text-[var(--color-on-surface-variant)]">
          {p.totalBudget != null && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">attach_money</span>
              {p.totalBudget.toLocaleString("es-DO")} DOP
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {new Date(p.updatedAt).toLocaleDateString("es-DO", { day: "2-digit", month: "short" })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onEdit(p)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-container)] transition-colors"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[16px] text-[var(--color-on-surface-variant)]">edit</span>
          </button>
          <button
            onClick={() => onDelete(p)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--color-error-container)] transition-colors"
            title="Eliminar"
          >
            <span className="material-symbols-outlined text-[16px] text-[var(--color-error)]">delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
