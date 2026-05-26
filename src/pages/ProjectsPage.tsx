import { useState } from "react"
import { ViewMode } from "gantt-task-react"
import type { Project } from "@/types"
import { useProjects, useDeleteProject } from "@/hooks/useProjects"
import { useAuthStore } from "@/store/authStore"
import ProjectCard        from "@/components/projects/ProjectCard"
import CreateProjectModal from "@/components/projects/CreateProjectModal"
import ProjectGantt       from "@/components/projects/ProjectGantt"

type ViewTab = "list" | "gantt"

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: ViewMode.Day,   label: "Día"  },
  { id: ViewMode.Week,  label: "Sem." },
  { id: ViewMode.Month, label: "Mes"  },
]

const STATUS_FILTERS: { value: Project["status"] | "all"; label: string }[] = [
  { value: "all",       label: "Todos"      },
  { value: "active",    label: "Activos"    },
  { value: "on_hold",   label: "En pausa"   },
  { value: "completed", label: "Completados"},
  { value: "cancelled", label: "Cancelados" },
]

export default function ProjectsPage() {
  const { activeTenant } = useAuthStore()
  const { data: projects = [], isLoading } = useProjects()
  const deleteProject = useDeleteProject()

  const [viewTab,    setViewTab]    = useState<ViewTab>("list")
  const [viewMode,   setViewMode]   = useState<ViewMode>(ViewMode.Month)
  const [statusFilter, setStatus]   = useState<Project["status"] | "all">("all")
  const [search,     setSearch]     = useState("")
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState<Project | undefined>()
  const [selected,   setSelected]   = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<Project | null>(null)

  const filtered = projects.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function handleEdit(p: Project) {
    setEditTarget(p)
    setModalOpen(true)
  }

  function handleDelete(p: Project) {
    setConfirmDel(p)
  }

  async function confirmDelete() {
    if (!confirmDel) return
    await deleteProject.mutateAsync(confirmDel.id)
    setConfirmDel(null)
    if (selected === confirmDel.id) setSelected(null)
  }

  if (!activeTenant) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-64 gap-3 text-[var(--color-on-surface-variant)]">
        <span className="material-symbols-outlined text-[48px] opacity-30">domain</span>
        <p className="text-body-md">Selecciona un tenant para ver los proyectos</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">Proyectos</h1>
          <p className="text-body-sm text-[var(--color-on-surface-variant)] mt-0.5">
            {projects.length} proyecto{projects.length !== 1 ? "s" : ""} · {activeTenant.name}
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-label-lg font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: "var(--color-primary)" }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo proyecto
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">search</span>
          <input
            type="text"
            placeholder="Buscar proyecto…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-body-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors w-52"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value as Project["status"] | "all")}
              className="px-3 py-1 rounded-full text-label-sm font-medium border transition-all"
              style={{
                background:  statusFilter === f.value ? "var(--color-primary)" : "transparent",
                color:       statusFilter === f.value ? "#fff" : "var(--color-on-surface-variant)",
                borderColor: statusFilter === f.value ? "var(--color-primary)" : "var(--color-outline-variant)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="ml-auto flex items-center gap-1 p-1 rounded-full bg-[var(--color-surface-container)]">
          {(["list", "gantt"] as ViewTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setViewTab(tab)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm font-medium transition-all"
              style={{
                background: viewTab === tab ? "white"                          : "transparent",
                color:      viewTab === tab ? "var(--color-primary)"           : "var(--color-on-surface-variant)",
                boxShadow:  viewTab === tab ? "0 1px 3px rgba(0,0,0,.12)"     : "none",
              }}
            >
              <span className="material-symbols-outlined text-[16px]">
                {tab === "list" ? "view_list" : "timeline"}
              </span>
              {tab === "list" ? "Lista" : "Gantt"}
            </button>
          ))}
        </div>
      </div>

      {/* Gantt view-mode selector */}
      {viewTab === "gantt" && (
        <div className="flex gap-1.5 mb-4">
          {VIEW_MODES.map(vm => (
            <button
              key={vm.id}
              onClick={() => setViewMode(vm.id)}
              className="px-3 py-1 rounded-full text-label-sm font-medium border transition-all"
              style={{
                background:  viewMode === vm.id ? "var(--color-secondary)" : "transparent",
                color:       viewMode === vm.id ? "#fff" : "var(--color-on-surface-variant)",
                borderColor: viewMode === vm.id ? "var(--color-secondary)" : "var(--color-outline-variant)",
              }}
            >
              {vm.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-44 rounded-2xl bg-[var(--color-surface-container)] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-[var(--color-on-surface-variant)]">
          <span className="material-symbols-outlined text-[48px] opacity-30">folder_open</span>
          <p className="text-body-md">
            {projects.length === 0 ? "Sin proyectos aún — crea el primero" : "Sin resultados para ese filtro"}
          </p>
        </div>
      ) : viewTab === "list" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              selected={selected === p.id}
              onSelect={pr => setSelected(pr.id === selected ? null : pr.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="tonal-card p-6">
          <ProjectGantt projects={filtered} viewMode={viewMode} />
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(undefined) }}
        editProject={editTarget}
      />

      {/* Confirm delete dialog */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setConfirmDel(null)}>
          <div className="tonal-card p-6 max-w-sm w-full animate-slide-up" onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined text-[40px] text-[var(--color-error)] block mb-3">delete_forever</span>
            <h3 className="text-title-md text-[var(--color-on-surface)] font-semibold mb-1">¿Eliminar proyecto?</h3>
            <p className="text-body-md text-[var(--color-on-surface-variant)] mb-5">
              <strong>{confirmDel.name}</strong> será eliminado permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 px-4 py-2 rounded-full border border-[var(--color-outline-variant)] text-label-md text-[var(--color-on-surface-variant)]">
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteProject.isPending}
                className="flex-1 px-4 py-2 rounded-full text-white text-label-md font-medium"
                style={{ background: "var(--color-error)" }}
              >
                {deleteProject.isPending ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
