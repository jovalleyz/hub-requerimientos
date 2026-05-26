import { useState } from "react"
import KanbanBoard from "@/components/requirements/KanbanBoard"
import CreateRequirementModal from "@/components/requirements/CreateRequirementModal"
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
  const [search,     setSearch]     = useState("")
  const [priority,   setPriority]   = useState("")
  const [product,    setProduct]    = useState("")
  const [modalOpen,  setModalOpen]  = useState(false)
  const [defaultStatus] = useState<RequirementStatus>("BACKLOG")

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

      {/* Search */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--color-outline)]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por título o código…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-body-md text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] hover:text-[var(--color-on-surface)]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Priority chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-label-sm text-[var(--color-on-surface-variant)] mr-1">Prioridad:</span>
          {PRIORITY_CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => setPriority(chip.value)}
              className="px-3 py-1 rounded-full text-label-sm font-medium border transition-all"
              style={{
                background:   priority === chip.value ? "var(--color-primary)" : "transparent",
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
          <span className="text-label-sm text-[var(--color-on-surface-variant)] mr-1">Línea:</span>
          {PRODUCT_CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => setProduct(chip.value)}
              className="px-3 py-1 rounded-full text-label-sm font-medium border transition-all"
              style={{
                background:  product === chip.value ? "var(--color-secondary)" : "transparent",
                color:       product === chip.value ? "#fff" : "var(--color-on-surface-variant)",
                borderColor: product === chip.value ? "var(--color-secondary)" : "var(--color-outline-variant)",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto -mx-4 px-4">
        <KanbanBoard search={search} priorityFilter={priority} productFilter={product} />
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
