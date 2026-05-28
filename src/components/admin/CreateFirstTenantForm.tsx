import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/services/firebase"
import { createTenant } from "@/services/adminService"
import { getTenant } from "@/services/adminService"
import { useAuthStore } from "@/store/authStore"

export default function CreateFirstTenantForm() {
  const { user, setUser, setActiveTenant } = useAuthStore()
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !user) return
    setSaving(true)
    setError("")
    try {
      const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      const tenantId = await createTenant({
        name: name.trim(),
        slug,
        plan: "enterprise",
        isActive: true,
        branding: { name: name.trim(), primaryColor: "#0058be", secondaryColor: "#f97316" },
      })

      const now = new Date().toISOString()
      await updateDoc(doc(db, "users", user.uid), {
        role: "ADMIN",
        tenantIds: [tenantId],
        activeTenantId: tenantId,
        updatedAt: now,
      })

      const updatedUser = {
        ...user,
        role: "ADMIN" as const,
        tenantIds: [tenantId],
        activeTenantId: tenantId,
        updatedAt: now,
      }
      setUser(updatedUser)

      const tenant = await getTenant(tenantId)
      if (tenant) setActiveTenant(tenant)
    } catch (err) {
      setError("Error al crear la organización. Intenta de nuevo.")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] gap-0">
      <div className="tonal-card w-full max-w-md p-8 animate-slide-up">
        {/* Icon */}
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <span className="material-symbols-outlined" style={{ color: "white", fontSize: 28 }}>domain_add</span>
        </div>

        <h2 className="text-headline-sm text-center text-[var(--color-on-surface)] mb-2">
          Crea tu organización
        </h2>
        <p className="text-body-sm text-center text-[var(--color-on-surface-variant)] mb-6">
          Este es el primer paso para empezar a gestionar requerimientos con tu equipo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md text-[var(--color-on-surface-variant)] mb-1.5">
              Nombre de la organización <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: UNIT S.A."
              autoFocus
              required
              minLength={2}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-body-md focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-label-sm text-[var(--color-error)] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-white text-label-lg font-medium disabled:opacity-50 transition-all active:scale-95"
            style={{ background: "var(--color-primary)" }}
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creando…</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">add_business</span>Crear organización</>
            )}
          </button>
        </form>

        <p className="text-label-sm text-center text-[var(--color-on-surface-variant)] mt-5">
          Serás el <strong>Administrador</strong> y podrás invitar a tu equipo después.
        </p>
      </div>
    </div>
  )
}
