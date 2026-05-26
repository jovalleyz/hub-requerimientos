import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Requirement, RequirementStatus, RequirementPriority, ProductLine } from "@/types"
import { useUpdateRequirement } from "@/hooks/useRequirementDetail"
import CreateRequirementModal from "@/components/requirements/CreateRequirementModal"

const STATUS_META: Record<RequirementStatus, { label: string; color: string; bg: string; icon: string }> = {
  BACKLOG:     { label: "Backlog",      color: "#44546f", bg: "#e8edf5", icon: "inbox" },
  ANALYSIS:    { label: "Análisis",    color: "#7C3AED", bg: "#f3eeff", icon: "manage_search" },
  IN_PROGRESS: { label: "En Progreso", color: "#0058be", bg: "#dce9ff", icon: "pending" },
  REVIEW:      { label: "Revisión",    color: "#D97706", bg: "#fef3c7", icon: "rate_review" },
  COMPLETED:   { label: "Completado",  color: "#1a7f1a", bg: "#dcfce7", icon: "task_alt" },
  CANCELLED:   { label: "Cancelado",   color: "#ba1a1a", bg: "#ffdad6", icon: "cancel" },
}

const PRIORITY_META: Record<RequirementPriority, { label: string; color: string }> = {
  CRITICAL: { label: "Crítico", color: "#ba1a1a" },
  HIGH:     { label: "Alto",    color: "#e65100" },
  MEDIUM:   { label: "Medio",   color: "#0058be" },
  LOW:      { label: "Bajo",    color: "#44546f" },
}

const PRODUCT_LABELS: Record<ProductLine, string> = {
  LIFE: "Vida", AUTO: "Auto", HEALTH: "Salud",
  HOME: "Hogar", COMMERCIAL: "Empresarial", PLATFORM: "Plataforma", GENERAL: "General",
}

const STATUS_ORDER: RequirementStatus[] = ["BACKLOG", "ANALYSIS", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"]

interface Props { requirement: Requirement }

export default function RequirementHeader({ requirement: r }: Props) {
  const navigate     = useNavigate()
  const update       = useUpdateRequirement(r.id)
  const [statusOpen, setStatusOpen] = useState(false)
  const [editOpen,   setEditOpen]   = useState(false)

  const sm = STATUS_META[r.status]
  const pm = PRIORITY_META[r.priority]

  function handleStatusChange(s: RequirementStatus) {
    update.mutate({ status: s })
    setStatusOpen(false)
  }

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-body-sm text-[var(--color-on-surface-variant)] mb-4">
        <button
          onClick={() => navigate("/requirements")}
          className="hover:text-[var(--color-primary)] transition-colors"
        >
          Pipeline
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        {r.code && (
          <span className="font-mono text-xs text-[var(--color-on-surface-variant)]">#{r.code}</span>
        )}
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[var(--color-on-surface)] truncate max-w-[200px]">{r.title}</span>
      </div>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <h1 className="text-headline-md text-[var(--color-on-surface)] leading-tight flex-1">
          {r.title}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          {/* Edit button */}
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Editar
          </button>

          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md font-semibold transition-all hover:opacity-80"
              style={{ background: sm.bg, color: sm.color }}
            >
              <span className="material-symbols-outlined text-[16px]">{sm.icon}</span>
              {sm.label}
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {statusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                <div className="absolute right-0 top-10 z-20 tonal-card min-w-[180px] py-1 shadow-xl rounded-2xl overflow-hidden">
                  {STATUS_ORDER.map(s => {
                    const m = STATUS_META[s]
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-body-md hover:bg-[var(--color-surface-container)] transition-colors"
                        style={{ color: s === r.status ? m.color : "var(--color-on-surface)" }}
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ color: m.color }}>
                          {m.icon}
                        </span>
                        {m.label}
                        {s === r.status && (
                          <span className="material-symbols-outlined text-[16px] ml-auto" style={{ color: m.color }}>
                            check
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metadata chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-medium border"
          style={{ borderColor: pm.color, color: pm.color }}
        >
          <span className="material-symbols-outlined text-[14px]">flag</span>
          {pm.label}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]">
          <span className="material-symbols-outlined text-[14px]">category</span>
          {PRODUCT_LABELS[r.productLine] ?? r.productLine}
        </div>
        {r.deadline && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {new Date(r.deadline).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        )}
        {r.estimatedCost != null && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]">
            <span className="material-symbols-outlined text-[14px]">attach_money</span>
            {r.estimatedCost.toLocaleString("es-DO")} DOP
          </div>
        )}
        {r.assignedTo.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]">
            <span className="material-symbols-outlined text-[14px]">group</span>
            {r.assignedTo.length} asignado{r.assignedTo.length !== 1 ? "s" : ""}
          </div>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]">
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          Actualizado {new Date(r.updatedAt).toLocaleDateString("es-DO", { day: "2-digit", month: "short" })}
        </div>
      </div>

      {/* Edit modal */}
      <CreateRequirementModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editRequirement={r}
      />
    </div>
  )
}
