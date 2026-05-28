import { useState } from "react"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/services/firebase"
import { useAuthStore } from "@/store/authStore"

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Manager",
  DEV: "Desarrollador",
  VIEWER: "Observador",
}

const fieldCls =
  "w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-body-md text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
const labelCls = "block text-label-sm text-[var(--color-on-surface-variant)] mb-1.5 font-medium"

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [displayName, setDisplayName] = useState(user?.displayName ?? "")
  const [jobTitle,    setJobTitle]    = useState(user?.jobTitle ?? "")
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState("")

  const initials = (user?.displayName ?? "U")
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !auth.currentUser) return
    setSaving(true)
    setError("")
    try {
      await updateProfile(auth.currentUser, { displayName })
      const now = new Date().toISOString()
      await updateDoc(doc(db, "users", user.uid), { displayName, jobTitle, updatedAt: now })
      setUser({ ...user, displayName, jobTitle, updatedAt: now })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError("No se pudo guardar. Intenta de nuevo.")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-headline-md" style={{ color: "var(--color-on-surface)" }}>Mi perfil</h1>
        <p className="text-body-sm mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>
          Gestiona tu información personal
        </p>
      </div>

      {/* Avatar + identity card */}
      <div className="tonal-card p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div
            style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--color-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 22, fontWeight: 700, flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <p className="text-title-md font-semibold" style={{ color: "var(--color-on-surface)" }}>
              {user?.displayName}
            </p>
            <p className="text-body-sm mb-1" style={{ color: "var(--color-on-surface-variant)" }}>
              {user?.email}
            </p>
            <span
              className="text-label-sm px-2.5 py-0.5 rounded-full font-semibold"
              style={{
                background: "var(--color-surface-container-high)",
                color: "var(--color-secondary)",
              }}
            >
              {ROLE_LABELS[user?.role ?? "VIEWER"]}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={labelCls}>Nombre completo</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              minLength={2}
              placeholder="Tu nombre"
              className={fieldCls}
            />
          </div>

          <div>
            <label className={labelCls}>Cargo</label>
            <input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="Ej: Product Manager"
              className={fieldCls}
            />
          </div>

          <div>
            <label className={labelCls}>Correo electrónico</label>
            <input
              value={user?.email ?? ""}
              readOnly
              className={fieldCls}
              style={{
                background: "var(--color-surface-container-low)",
                color: "var(--color-on-surface-variant)",
                cursor: "not-allowed",
              }}
            />
            <p className="text-label-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
              El correo se gestiona a través del proveedor de autenticación.
            </p>
          </div>

          {error && (
            <p className="text-label-sm flex items-center gap-1" style={{ color: "var(--color-error)" }}>
              <span className="material-symbols-outlined text-[14px]">error</span>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-label-lg font-medium disabled:opacity-40 transition-all active:scale-95"
            style={{ background: saved ? "var(--color-success)" : "var(--color-primary)" }}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando…
              </>
            ) : saved ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Guardado
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Guardar cambios
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info card */}
      <div className="tonal-card p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px]" style={{ color: "var(--color-secondary)", marginTop: 2 }}>
            info
          </span>
          <div>
            <p className="text-body-md font-medium" style={{ color: "var(--color-on-surface)" }}>
              Organización: {user?.activeTenantId ? "UNIT S.A." : "Sin organización"}
            </p>
            <p className="text-body-sm mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>
              Para cambiar tu foto de perfil, actualízala desde tu cuenta de Google
              o Microsoft asociada a este correo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
