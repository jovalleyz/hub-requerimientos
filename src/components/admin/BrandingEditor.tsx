import { useState, useRef } from "react"
import type { Tenant } from "@/types"
import { useSaveBranding, useUploadLogo } from "@/hooks/useAdmin"

interface Props { tenant: Tenant }

export default function BrandingEditor({ tenant }: Props) {
  const save       = useSaveBranding()
  const uploadLogo = useUploadLogo()

  const [primary,   setPrimary]   = useState(tenant.branding.primaryColor   || "#002169")
  const [secondary, setSecondary] = useState(tenant.branding.secondaryColor || "#0058be")
  const [logoProgress, setLogoProgress] = useState<number | null>(null)
  const [dirty, setDirty]         = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleColorChange(field: "primary" | "secondary", value: string) {
    if (field === "primary")   { setPrimary(value);   setDirty(true) }
    if (field === "secondary") { setSecondary(value); setDirty(true) }
  }

  async function handleSave() {
    await save.mutateAsync({
      primaryColor:   primary,
      secondaryColor: secondary,
      name:           tenant.branding.name || tenant.name,
    })
    setDirty(false)
  }

  async function handleLogoFile(files: FileList | null) {
    if (!files?.[0]) return
    setLogoProgress(0)
    await uploadLogo.mutateAsync({
      file: files[0],
      onProgress: pct => setLogoProgress(pct),
    })
    setLogoProgress(null)
  }

  return (
    <div className="max-w-2xl space-y-8">

      {/* Live preview card */}
      <div>
        <h3 className="text-label-lg font-semibold text-[var(--color-on-surface-variant)] mb-3 uppercase tracking-wide">
          Vista previa
        </h3>
        <div
          className="rounded-3xl p-6 flex items-center gap-4 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}
        >
          {tenant.branding.logoUrl ? (
            <img
              src={tenant.branding.logoUrl}
              alt="Logo"
              className="w-14 h-14 rounded-2xl object-cover bg-white/20"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[28px]">shield_with_heart</span>
            </div>
          )}
          <div>
            <p className="text-white text-xl font-bold leading-tight">{tenant.name}</p>
            <p className="text-white/70 text-sm mt-0.5">InsurTech Pro · {tenant.plan}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]">notifications</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]">person</span>
            </div>
          </div>
        </div>
      </div>

      {/* Color pickers */}
      <div>
        <h3 className="text-label-lg font-semibold text-[var(--color-on-surface-variant)] mb-3 uppercase tracking-wide">
          Colores de marca
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Color primario",    field: "primary"   as const, value: primary   },
            { label: "Color secundario",  field: "secondary" as const, value: secondary },
          ].map(c => (
            <div key={c.field} className="tonal-card p-4 flex items-center gap-4">
              <label className="cursor-pointer group">
                <div
                  className="w-14 h-14 rounded-2xl border-4 border-white shadow-md transition-transform group-hover:scale-105"
                  style={{ background: c.value }}
                />
                <input
                  type="color"
                  value={c.value}
                  onChange={e => handleColorChange(c.field, e.target.value)}
                  className="sr-only"
                />
              </label>
              <div className="flex-1">
                <p className="text-body-md font-medium text-[var(--color-on-surface)]">{c.label}</p>
                <p className="text-label-sm text-[var(--color-on-surface-variant)] font-mono mt-0.5">
                  {c.value.toUpperCase()}
                </p>
                <input
                  type="text"
                  value={c.value}
                  onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) handleColorChange(c.field, e.target.value) }}
                  className="mt-1.5 w-28 px-2 py-1 rounded-lg border border-[var(--color-outline-variant)] text-label-sm font-mono focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        {dirty && (
          <button
            onClick={handleSave}
            disabled={save.isPending}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-label-lg font-medium disabled:opacity-50 transition-all active:scale-95"
            style={{ background: "var(--color-primary)" }}
          >
            {save.isPending
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Aplicando…</>
              : <><span className="material-symbols-outlined text-[18px]">palette</span>Aplicar colores</>
            }
          </button>
        )}
      </div>

      {/* Logo upload */}
      <div>
        <h3 className="text-label-lg font-semibold text-[var(--color-on-surface-variant)] mb-3 uppercase tracking-wide">
          Logotipo
        </h3>
        <div className="flex items-center gap-6">
          {/* Current logo */}
          <div
            className="w-20 h-20 rounded-2xl border-2 border-dashed border-[var(--color-outline-variant)] flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-[var(--color-primary)] transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {tenant.branding.logoUrl ? (
              <img src={tenant.branding.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[32px] text-[var(--color-outline)]">add_photo_alternate</span>
            )}
          </div>

          <div>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] text-label-md hover:bg-[var(--color-surface-container)] transition-colors mb-2"
            >
              <span className="material-symbols-outlined text-[16px]">upload</span>
              {tenant.branding.logoUrl ? "Cambiar logo" : "Subir logo"}
            </button>
            <p className="text-label-sm text-[var(--color-on-surface-variant)]">PNG, JPG, SVG · Máx. 5 MB</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => void handleLogoFile(e.target.files)}
          />
        </div>

        {logoProgress !== null && (
          <div className="mt-3 max-w-xs">
            <div className="flex justify-between text-label-sm text-[var(--color-on-surface-variant)] mb-1">
              <span>Subiendo logo…</span><span>{logoProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--color-surface-container)] overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${logoProgress}%`, background: "var(--color-secondary)" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
