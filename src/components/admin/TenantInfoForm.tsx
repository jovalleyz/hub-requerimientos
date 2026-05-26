import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { Tenant } from "@/types"
import { useUpdateTenant } from "@/hooks/useAdmin"

const PLAN_OPTS: { value: Tenant["plan"]; label: string; desc: string }[] = [
  { value: "standard",   label: "Standard",   desc: "Hasta 50 reqs · 10 usuarios" },
  { value: "enterprise", label: "Enterprise", desc: "Sin límite · SLA garantizado" },
]

const fieldCls =
  "w-full px-3 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-body-md text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
const labelCls = "block text-label-sm text-[var(--color-on-surface-variant)] mb-1.5"

interface FormValues {
  name:   string
  slug:   string
  plan:   Tenant["plan"]
}

interface Props { tenant: Tenant }

export default function TenantInfoForm({ tenant }: Props) {
  const update = useUpdateTenant()

  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } =
    useForm<FormValues>({
      defaultValues: {
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
      },
    })

  useEffect(() => {
    reset({ name: tenant.name, slug: tenant.slug, plan: tenant.plan })
  }, [tenant, reset])

  async function onSubmit(values: FormValues) {
    await update.mutateAsync({ name: values.name, slug: values.slug, plan: values.plan })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      {/* Name */}
      <div>
        <label className={labelCls}>Nombre del tenant <span className="text-[var(--color-error)]">*</span></label>
        <input
          {...register("name", { required: "Requerido", minLength: { value: 2, message: "Mínimo 2 caracteres" } })}
          placeholder="Seguros Universal"
          className={fieldCls}
        />
        {errors.name && <p className="text-label-sm text-[var(--color-error)] mt-1">{errors.name.message}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className={labelCls}>Slug (URL amigable)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm text-[var(--color-on-surface-variant)]">app/</span>
          <input
            {...register("slug", {
              pattern: { value: /^[a-z0-9-]+$/, message: "Solo minúsculas, números y guiones" }
            })}
            placeholder="seguros-universal"
            className={fieldCls}
            style={{ paddingLeft: "3rem" }}
          />
        </div>
        {errors.slug && <p className="text-label-sm text-[var(--color-error)] mt-1">{errors.slug.message}</p>}
      </div>

      {/* Plan */}
      <div>
        <label className={labelCls}>Plan</label>
        <div className="grid grid-cols-2 gap-3">
          {PLAN_OPTS.map(p => (
            <label
              key={p.value}
              className="flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all"
              style={{
                borderColor: "var(--color-outline-variant)",
                background:  "transparent",
              }}
            >
              <input {...register("plan")} type="radio" value={p.value} className="mt-0.5 accent-[var(--color-primary)]" />
              <div>
                <p className="text-label-md font-semibold text-[var(--color-on-surface)]">{p.label}</p>
                <p className="text-label-sm text-[var(--color-on-surface-variant)]">{p.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Status toggle */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--color-outline-variant)]">
        <div>
          <p className="text-body-md text-[var(--color-on-surface)] font-medium">Tenant activo</p>
          <p className="text-label-sm text-[var(--color-on-surface-variant)]">Desactivar bloquea el acceso a todos los usuarios</p>
        </div>
        <div
          onClick={() => update.mutate({ isActive: !tenant.isActive })}
          className="relative w-12 h-6 rounded-full cursor-pointer transition-all"
          style={{ background: tenant.isActive ? "var(--color-primary)" : "var(--color-surface-container)" }}
        >
          <div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
            style={{ left: tenant.isActive ? "1.75rem" : "0.25rem" }}
          />
        </div>
      </div>

      {/* Save */}
      <button
        type="submit"
        disabled={!isDirty || isSubmitting}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-label-lg font-medium disabled:opacity-40 transition-all active:scale-95"
        style={{ background: "var(--color-primary)" }}
      >
        {isSubmitting
          ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando…</>
          : <><span className="material-symbols-outlined text-[18px]">save</span>Guardar cambios</>
        }
      </button>
    </form>
  )
}
