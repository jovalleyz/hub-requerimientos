import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { useRequirement } from "@/hooks/useRequirementDetail"
import RequirementHeader from "@/components/requirements/RequirementHeader"
import TaskList         from "@/components/requirements/TaskList"
import NoteThread       from "@/components/requirements/NoteThread"
import ActivityTimeline from "@/components/requirements/ActivityTimeline"
import DocumentPanel    from "@/components/requirements/DocumentPanel"

type Tab = "overview" | "tasks" | "notes" | "activity" | "documents"

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",   label: "Descripción", icon: "article" },
  { id: "tasks",      label: "Tareas",      icon: "checklist" },
  { id: "notes",      label: "Notas",       icon: "chat_bubble" },
  { id: "activity",   label: "Actividad",   icon: "history" },
  { id: "documents",  label: "Documentos",  icon: "attach_file" },
]

export default function RequirementDetailPage() {
  const { id = "" } = useParams()
  const navigate     = useNavigate()
  const { activeTenant } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  const { data: req, isLoading, isError } = useRequirement(id)

  // No tenant
  if (!activeTenant) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-64 gap-4 text-[var(--color-on-surface-variant)]">
        <span className="material-symbols-outlined text-[48px] opacity-30">domain</span>
        <p className="text-body-md">Selecciona un tenant para ver el requerimiento</p>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="animate-fade-in max-w-4xl">
        <div className="h-4 w-48 bg-[var(--color-surface-container)] rounded-full animate-pulse mb-6" />
        <div className="h-8 w-3/4 bg-[var(--color-surface-container)] rounded-xl animate-pulse mb-4" />
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-7 w-20 rounded-full bg-[var(--color-surface-container)] animate-pulse" />
          ))}
        </div>
        <div className="h-12 w-full bg-[var(--color-surface-container)] rounded-2xl animate-pulse mb-6" />
        <div className="tonal-card p-6 h-64 animate-pulse" />
      </div>
    )
  }

  // Error or not found
  if (isError || !req) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-64 gap-4">
        <span className="material-symbols-outlined text-[48px] text-[var(--color-error)]">error</span>
        <p className="text-body-md text-[var(--color-error)]">Requerimiento no encontrado</p>
        <button
          onClick={() => navigate("/requirements")}
          className="px-5 py-2 rounded-full text-white text-label-md"
          style={{ background: "var(--color-primary)" }}
        >
          Volver al Pipeline
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header with breadcrumb, title, status, metadata */}
      <RequirementHeader requirement={req} />

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-[var(--color-outline-variant)] overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-3 text-label-md font-medium whitespace-nowrap transition-all border-b-2 -mb-px"
            style={{
              color:       activeTab === tab.id ? "var(--color-primary)"              : "var(--color-on-surface-variant)",
              borderColor: activeTab === tab.id ? "var(--color-primary)"              : "transparent",
            }}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tonal-card p-6">
        {activeTab === "overview" && (
          <div className="animate-fade-in">
            {req.description ? (
              <p className="text-body-md text-[var(--color-on-surface)] leading-relaxed whitespace-pre-wrap">
                {req.description}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-[var(--color-on-surface-variant)]">
                <span className="material-symbols-outlined text-[40px] opacity-30 block mb-2">article</span>
                <p className="text-body-md">Sin descripción</p>
              </div>
            )}

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[var(--color-outline-variant)]">
              {[
                { label: "Creado por", value: req.createdBy },
                { label: "Creado",    value: new Date(req.createdAt).toLocaleDateString("es-DO", { dateStyle: "medium" }) },
                { label: "Actualizado", value: new Date(req.updatedAt).toLocaleDateString("es-DO", { dateStyle: "medium" }) },
                req.linkedProjectId ? { label: "Proyecto", value: req.linkedProjectId } : null,
              ].filter(Boolean).map(item => (
                <div key={item!.label}>
                  <p className="text-label-sm text-[var(--color-on-surface-variant)] mb-0.5">{item!.label}</p>
                  <p className="text-body-md text-[var(--color-on-surface)] font-medium">{item!.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tasks"     && <TaskList         reqId={id} />}
        {activeTab === "notes"     && <NoteThread        reqId={id} />}
        {activeTab === "activity"  && <ActivityTimeline  reqId={id} />}
        {activeTab === "documents" && <DocumentPanel     reqId={id} />}
      </div>
    </div>
  )
}
