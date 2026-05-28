import { useState } from "react"
import KanbanBoard from "@/components/requirements/KanbanBoard"
import CreateRequirementModal from "@/components/requirements/CreateRequirementModal"
import { useRequirements } from "@/hooks/useRequirements"
import { useUiStore } from "@/store/uiStore"
import type { RequirementStatus } from "@/types"

const PRIORITY_CHIPS = [
  { label: "Todos",   value: "" },
  { label: "Crítico", value: "CRITICAL" },
  { label: "Alto",    value: "HIGH" },
  { label: "Medio",   value: "MEDIUM" },
  { label: "Bajo",    value: "LOW" },
]

const PRODUCT_CHIPS = [
  { label: "Todos",       value: "" },
  { label: "Vida",        value: "LIFE" },
  { label: "Auto",        value: "AUTO" },
  { label: "Salud",       value: "HEALTH" },
  { label: "Hogar",       value: "HOME" },
  { label: "Empresarial", value: "COMMERCIAL" },
  { label: "Plataforma",  value: "PLATFORM" },
]

export default function PipelinePage() {
  const { searchQuery } = useUiStore()
  const [priority,   setPriority]   = useState("")
  const [product,    setProduct]    = useState("")
  const [tagFilter,  setTagFilter]  = useState("")
  const [modalOpen,  setModalOpen]  = useState(false)
  const [defaultStatus] = useState<RequirementStatus>("BACKLOG")
  const { data: allReqs = [] } = useRequirements()
  const allTags = [...new Set(allReqs.flatMap(r => r.tags ?? []))]

  return (
    <div className="animate-fade-in flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">Pipeline</h1>
          <p className="text-body-sm text-[var(--color-on-surface-variant)] mt-0.5">
            Gestión visual del flujo de requerimientos
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-white text-label-lg font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: "var(--color-primary)" }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar flex flex-col gap-3 mb-5 px-4 py-3">
        {/* Priority chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-label-sm font-medium mr-1" style={{ color: "var(--color-on-surface-variant)" }}>Prioridad:</span>
          {PRIORITY_CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => setPriority(chip.value)}
              className="px-3 py-1 rounded-full text-label-sm font-medium border transition-all"
              style={{
                background:   priority === chip.value ? "var(--color-primary)" : "var(--color-surface-container-low)",
                color:        priority === chip.value ? "#fff" : "var(--color-on-surface-variant)",
                borderColor:  priority === chip.value ? "var(--color-primary)" : "var(--color-outline-variant)",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Product chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-label-sm font-medium mr-1" style={{ color: "var(--color-on-surface-variant)" }}>Línea:</span>
          {PRODUCT_CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => setProduct(chip.value)}
              className="px-3 py-1 rounded-full text-label-sm font-medium border transition-all"
              style={{
                background:  product === chip.value ? "var(--color-secondary)" : "var(--color-surface-container-low)",
                color:       product === chip.value ? "#fff" : "var(--color-on-surface-variant)",
                borderColor: product === chip.value ? "var(--color-secondary)" : "var(--color-outline-variant)",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Tag chips */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-label-sm font-medium mr-1" style={{ color: "var(--color-on-surface-variant)" }}>Etiqueta:</span>
            <button
              onClick={() => setTagFilter("")}
              className="px-3 py-1 rounded-full text-label-sm font-medium border transition-all"
              style={{
                background: tagFilter === "" ? "#7C3AED" : "var(--color-surface)",
                color: tagFilter === "" ? "#fff" : "var(--color-on-surface-variant)",
                borderColor: tagFilter === "" ? "#7C3AED" : "var(--color-outline-variant)",
              }}
            >Todas</button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? "" : tag)}
                className="px-3 py-1 rounded-full text-label-sm font-medium border transition-all"
                style={{
                  background: tagFilter === tag ? "#7C3AED" : "var(--color-surface)",
                  color: tagFilter === tag ? "#fff" : "var(--color-on-surface-variant)",
                  borderColor: tagFilter === tag ? "#7C3AED" : "var(--color-outline-variant)",
                }}
              >#{tag}</button>
            ))}
          </div>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto -mx-4 px-4">
        <KanbanBoard search={searchQuery} priorityFilter={priority} productFilter={product} tagFilter={tagFilter} />
      </div>

      {/* FAB — mobile */}
      <button
        onClick={() => setModalOpen(true)}
        className="sm:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white z-20 transition-all active:scale-95"
        style={{ background: "var(--color-primary)" }}
        aria-label="Crear requerimiento"
      >
        <span className="material-symbols-outlined text-[24px]">add</span>
      </button>

      {/* Create modal */}
      <CreateRequirementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultStatus={defaultStatus}
      />
    </div>
  )
}
