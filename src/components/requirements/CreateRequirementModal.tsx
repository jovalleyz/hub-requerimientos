import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { RequirementStatus, RequirementPriority, ProductLine } from "@/types"
import { useCreateRequirement, useRequirements } from "@/hooks/useRequirements"
import { useUpdateRequirement } from "@/hooks/useRequirementDetail"
import TagInput from "@/components/common/TagInput"
import type { Requirement } from "@/types"

// ─── Form shape ───────────────────────────────────────────────────────────────

interface FormValues {
  title:         string
  description:   string
  code:          string
  priority:      RequirementPriority
  productLine:   ProductLine
  status:        RequirementStatus
  deadline:      string
  estimatedCost: string   // kept as string for input, converted on submit
}

// ─── Field configs ────────────────────────────────────────────────────────────

const PRIORITIES: { value: RequirementPriority; label: string }[] = [
  { value: "CRITICAL", label: "Crítico"  },
  { value: "HIGH",     label: "Alto"     },
  { value: "MEDIUM",   label: "Medio"    },
  { value: "LOW",      label: "Bajo"     },
]

const PRODUCT_LINES: { value: ProductLine; label: string }[] = [
  { value: "LIFE",       label: "Vida"         },
  { value: "AUTO",       label: "Auto"         },
  { value: "HEALTH",     label: "Salud"        },
  { value: "HOME",       label: "Hogar"        },
  { value: "COMMERCIAL", label: "Empresarial"  },
  { value: "PLATFORM",   label: "Plataforma"   },
  { value: "GENERAL",    label: "General"      },
]

const STATUSES: { value: RequirementStatus; label: string }[] = [
  { value: "BACKLOG",      label: "Backlog"      },
  { value: "ANALYSIS",     label: "Análisis"    },
  { value: "IN_PROGRESS",  label: "En Progreso"  },
  { value: "REVIEW",       label: "Revisión"    },
  { value: "COMPLETED",    label: "Completado"   },
  { value: "CANCELLED",    label: "Cancelado"    },
]

const fieldCls =
  "w-full px-3 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-body-md text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
const labelCls = "block text-label-md text-[var(--color-on-surface-variant)] mb-1.5"
const errorCls = "text-label-sm text-[var(--color-error)] mt-1"

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open:             boolean
  onClose:          () => void
  defaultStatus?:   RequirementStatus
  editRequirement?: Requirement
}

function toDefaults(r?: Requirement, ds?: RequirementStatus): FormValues {
  return {
    title:         r?.title              ?? "",
    description:   r?.description       ?? "",
    code:          r?.code              ?? "",
    priority:      r?.priority          ?? "MEDIUM",
    productLine:   r?.productLine       ?? "GENERAL",
    status:        r?.status            ?? ds ?? "BACKLOG",
    deadline:      r?.deadline?.slice(0, 10) ?? "",
    estimatedCost: r?.estimatedCost != null ? String(r.estimatedCost) : "",
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateRequirementModal({
  open, onClose, defaultStatus, editRequirement,
}: Props) {
  const create  = useCreateRequirement()
  const update  = useUpdateRequirement(editRequirement?.id ?? "")
  const { data: allReqs = [] } = useRequirements()
  const isEdit  = !!editRequirement
  const [tags, setTags] = useState<string[]>(editRequirement?.tags ?? [])

  const allTags = [...new Set(allReqs.flatMap(r => r.tags ?? []))]

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: toDefaults(editRequirement, defaultStatus) })

  useEffect(() => {
    if (open) {
      reset(toDefaults(editRequirement, defaultStatus))
      setTags(editRequirement?.tags ?? [])
    }
  }, [open, editRequirement, defaultStatus, reset])

  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [open, onClose])

  if (!open) return null

  async function onSubmit(values: FormValues) {
    const payload = {
      title:         values.title.trim(),
      description:   values.description.trim(),
      code:          values.code.trim() || undefined,
      priority:      values.priority,
      productLine:   values.productLine,
      status:        values.status,
      deadline:      values.deadline ? new Date(values.deadline).toISOString() : undefined,
      estimatedCost: values.estimatedCost ? Number(values.estimatedCost) : undefined,
      assignedTo:    editRequirement?.assignedTo ?? [],
      tags,
    }

    if (isEdit) {
      await update.mutateAsync(payload)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await create.mutateAsync(payload as any)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="tonal-card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-outline-variant)]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[var(--color-primary)]">
              {isEdit ? "edit" : "add_circle"}
            </span>
            <h2 className="text-title-lg text-[var(--color-on-surface)] font-semibold">
              {isEdit ? "Editar Requerimiento" : "Nuevo Requerimiento"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-container)] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-[var(--color-on-surface-variant)]">
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

          {/* Title */}
          <div>
            <label className={labelCls}>
              Título <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              {...register("title", { required: "El título es obligatorio", minLength: { value: 3, message: "Mínimo 3 caracteres" } })}
              placeholder="Ej: Integración con sistema de pagos"
              className={fieldCls}
            />
            {errors.title && <p className={errorCls}>{errors.title.message}</p>}
          </div>

          {/* Code */}
          <div>
            <label className={labelCls}>Código (opcional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-md text-[var(--color-on-surface-variant)]">#</span>
              <input
                {...register("code")}
                placeholder="REQ-001"
                className={fieldCls}
                style={{ paddingLeft: "1.75rem" }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              {...register("description")}
              placeholder="Describe el requerimiento en detalle…"
              rows={3}
              className={fieldCls}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Priority + Product Line */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Prioridad <span className="text-[var(--color-error)]">*</span>
              </label>
              <select {...register("priority", { required: true })} className={fieldCls}>
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Línea de negocio <span className="text-[var(--color-error)]">*</span>
              </label>
              <select {...register("productLine", { required: true })} className={fieldCls}>
                {PRODUCT_LINES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Estado</label>
            <select {...register("status")} className={fieldCls}>
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Deadline + Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Deadline</label>
              <input {...register("deadline")} type="date" className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Costo estimado (DOP)</label>
              <input
                {...register("estimatedCost")}
                type="number"
                min={0}
                step={100}
                placeholder="0"
                className={fieldCls}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={labelCls}>Etiquetas</label>
            <TagInput value={tags} onChange={setTags} suggestions={allTags} placeholder="Ej: backend, urgente, v2…" />
            <p className="text-label-sm text-[var(--color-on-surface-variant)] mt-1">Enter o coma para agregar, Backspace para eliminar</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-[var(--color-outline-variant)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-full text-label-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-label-lg text-white font-medium disabled:opacity-50 transition-all active:scale-95"
              style={{ background: "var(--color-primary)" }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    {isEdit ? "save" : "add"}
                  </span>
                  {isEdit ? "Guardar cambios" : "Crear requerimiento"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
