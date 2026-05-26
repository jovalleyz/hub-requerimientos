import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import type { Project, ProjectPhase } from "@/types"
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects"
import { buildEmptyPhase } from "@/services/projectsService"

interface FormPhase {
  id:        string
  name:      string
  startDate: string
  endDate:   string
  status:    ProjectPhase["status"]
  progress:  number
}

interface FormValues {
  name:        string
  description: string
  status:      Project["status"]
  totalBudget: string
  phases:      FormPhase[]
}

const fieldCls =
  "w-full px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-body-md text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
const labelCls = "block text-label-sm text-[var(--color-on-surface-variant)] mb-1"

const STATUS_OPTS: { value: Project["status"]; label: string }[] = [
  { value: "active",    label: "Activo"     },
  { value: "on_hold",   label: "En pausa"   },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado"  },
]

const PHASE_STATUS_OPTS: { value: ProjectPhase["status"]; label: string }[] = [
  { value: "pending",   label: "Pendiente"  },
  { value: "active",    label: "Activo"     },
  { value: "completed", label: "Completado" },
]

function toDefaults(p?: Project): FormValues {
  return {
    name:        p?.name        ?? "",
    description: p?.description ?? "",
    status:      p?.status      ?? "active",
    totalBudget: p?.totalBudget != null ? String(p.totalBudget) : "",
    phases: (p?.phases ?? [buildEmptyPhase()]).map(ph => ({
      id:        ph.id,
      name:      ph.name,
      startDate: ph.startDate,
      endDate:   ph.endDate,
      status:    ph.status,
      progress:  ph.progress,
    })),
  }
}

interface Props {
  open:          boolean
  onClose:       () => void
  editProject?:  Project
}

export default function CreateProjectModal({ open, onClose, editProject }: Props) {
  const create  = useCreateProject()
  const update  = useUpdateProject()
  const isEdit  = !!editProject

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ defaultValues: toDefaults(editProject) })

  const { fields, append, remove } = useFieldArray({ control, name: "phases" })

  useEffect(() => {
    if (open) reset(toDefaults(editProject))
  }, [open, editProject, reset])

  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [open, onClose])

  if (!open) return null

  async function onSubmit(values: FormValues) {
    const payload: Omit<Project, "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy"> = {
      name:        values.name.trim(),
      description: values.description.trim(),
      status:      values.status,
      totalBudget: values.totalBudget ? Number(values.totalBudget) : undefined,
      phases: values.phases.map(ph => ({
        id:        ph.id,
        name:      ph.name.trim(),
        startDate: ph.startDate,
        endDate:   ph.endDate,
        status:    ph.status,
        progress:  Number(ph.progress),
      })),
    }
    if (isEdit && editProject) {
      await update.mutateAsync({ id: editProject.id, data: payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="tonal-card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-outline-variant)] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[var(--color-primary)]">
              {isEdit ? "edit" : "add_circle"}
            </span>
            <h2 className="text-title-lg text-[var(--color-on-surface)] font-semibold">
              {isEdit ? "Editar Proyecto" : "Nuevo Proyecto"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-container)] transition-colors">
            <span className="material-symbols-outlined text-[20px] text-[var(--color-on-surface-variant)]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

          {/* Name */}
          <div>
            <label className={labelCls}>Nombre <span className="text-[var(--color-error)]">*</span></label>
            <input
              {...register("name", { required: "El nombre es obligatorio", minLength: { value: 3, message: "Mínimo 3 caracteres" } })}
              placeholder="Ej: Portal de Agentes 2026"
              className={fieldCls}
            />
            {errors.name && <p className="text-label-sm text-[var(--color-error)] mt-1">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Descripción</label>
            <textarea {...register("description")} rows={2} placeholder="Objetivo y alcance del proyecto…" className={fieldCls} style={{ resize: "vertical" }} />
          </div>

          {/* Status + Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Estado</label>
              <select {...register("status")} className={fieldCls}>
                {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Presupuesto total (DOP)</label>
              <input {...register("totalBudget")} type="number" min={0} step={1000} placeholder="0" className={fieldCls} />
            </div>
          </div>

          {/* Phases */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-title-sm text-[var(--color-on-surface)] font-semibold">Fases del proyecto</h3>
              <button
                type="button"
                onClick={() => append(buildEmptyPhase())}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-label-sm border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-surface-container)] transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                Agregar fase
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="p-4 rounded-2xl border border-[var(--color-outline-variant)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-label-md font-semibold text-[var(--color-on-surface-variant)]">
                      Fase {idx + 1}
                    </span>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(idx)} className="text-[var(--color-error)] hover:opacity-70 transition-opacity">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>

                  {/* Phase name */}
                  <input {...register(`phases.${idx}.name`, { required: true })} placeholder="Nombre de la fase" className={fieldCls} />

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Inicio</label>
                      <input {...register(`phases.${idx}.startDate`, { required: true })} type="date" className={fieldCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Fin</label>
                      <input {...register(`phases.${idx}.endDate`, { required: true })} type="date" className={fieldCls} />
                    </div>
                  </div>

                  {/* Status + Progress */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Estado</label>
                      <select {...register(`phases.${idx}.status`)} className={fieldCls}>
                        {PHASE_STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Progreso: {`${field.progress ?? 0}%`}</label>
                      <input
                        {...register(`phases.${idx}.progress`)}
                        type="range" min={0} max={100} step={5}
                        className="w-full accent-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-[var(--color-outline-variant)]">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-full text-label-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-label-lg text-white font-medium disabled:opacity-50 transition-all active:scale-95"
              style={{ background: "var(--color-primary)" }}
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando…</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">{isEdit ? "save" : "add"}</span>{isEdit ? "Guardar" : "Crear proyecto"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

