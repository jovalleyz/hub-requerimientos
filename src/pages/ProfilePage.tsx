import { useState } from "react"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/services/firebase"
import { useAuthStore } from "@/store/authStore"

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN:   { label: "Administrador", color: "#0058be", bg: "#dce9ff" },
  MANAGER: { label: "Manager",       color: "#7C3AED", bg: "#ede9fe" },
  DEV:     { label: "Desarrollador", color: "#D97706", bg: "#fef3c7" },
  VIEWER:  { label: "Observador",    color: "#45546f", bg: "#e4eaf5" },
}

const fieldCls =
  "w-full px-4 py-3 rounded-xl border text-body-md text-[var(--color-on-surface)] focus:outline-none transition-colors"
const labelCls = "block text-body-sm font-semibold text-[var(--color-on-surface-variant)] mb-2"

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [displayName, setDisplayName] = useState(user?.displayName ?? "")
  const [jobTitle,    setJobTitle]    = useState(user?.jobTitle ?? "")
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState("")

  const initials = (user?.displayName ?? "U")
    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
  const role = ROLE_META[user?.role ?? "VIEWER"]

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
    <div className="animate-fade-in max-w-2xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-headline-md" style={{ color: "var(--color-on-surface)" }}>Mi perfil</h1>
        <p className="text-body-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      {/* Identity card */}
      <div className="tonal-card overflow-hidden mb-4">
        {/* Header band */}
        <div
          className="h-20 w-full"
          style={{
            background: "linear-gradient(135deg, var(--color-primary) 0%, #2170e4 100%)",
          }}
        />
        {/* Avatar + identity */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{
                background: "var(--color-primary)",
                border: "3px solid white",
                boxShadow: "0 2px 8px rgba(0,88,190,0.35)",
                fontSize: 22,
              }}
            >
              {initials}
            </div>
            <div className="mb-1">
              <p className="text-title-md font-semibold" style={{ color: "var(--color-on-surface)" }}>
                {user?.displayName}
              </p>
              <p className="text-body-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                {user?.email}
              </p>
            </div>
            <span
              className="ml-auto mb-1 text-label-sm px-3 py-1 rounded-full font-semibold"
              style={{ background: role.bg, color: role.color }}
            >
              {role.label}
            </span>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl"
            style={{ background: "var(--color-surface-container-low)" }}
          >
            {[
              { icon: "domain",     label: "Organización", value: "UNIT S.A." },
              { icon: "shield",     label: "Rol",          value: role.label },
              { icon: "calendar_today", label: "Miembro desde", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("es-DO", { month: "short", year: "numeric" }) : "—" },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <span className="material-symbols-outlined text-[20px] block mb-1" style={{ color: "var(--color-primary)" }}>
                  {stat.icon}
                </span>
                <p className="text-body-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{stat.value}</p>
                <p className="text-label-sm" style={{ color: "var(--color-on-surface-variant)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit form card */}
      <div className="tonal-card p-6 mb-4">
        <h2 className="text-title-md font-semibold mb-5" style={{ color: "var(--color-on-surface)" }}>
          Información personal
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nombre completo</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                minLength={2}
                placeholder="Tu nombre"
                className={fieldCls}
                style={{
                  borderColor: "var(--color-outline-variant)",
                  background: "var(--color-surface)",
                }}
                onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
                onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"}
              />
            </div>
            <div>
              <label className={labelCls}>Cargo / Puesto</label>
              <input
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="Ej: Product Manager"
                className={fieldCls}
                style={{
                  borderColor: "var(--color-outline-variant)",
                  background: "var(--color-surface)",
                }}
                onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
                onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Correo electrónico</label>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                lock
              </span>
              <input
                value={user?.email ?? ""}
                readOnly
                className={fieldCls}
                style={{
                  paddingLeft: "2.75rem",
                  borderColor: "var(--color-outline-variant)",
                  background: "var(--color-surface-container-low)",
                  color: "var(--color-on-surface-variant)",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <p className="text-label-sm mt-1.5" style={{ color: "var(--color-on-surface-variant)" }}>
              Gestionado por tu proveedor de autenticación (Google / Microsoft).
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-body-sm"
              style={{ background: "var(--color-error-container)", color: "var(--color-error)" }}
            >
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-label-lg font-medium disabled:opacity-50 transition-all active:scale-95"
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
                  Cambios guardados
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Guardar cambios
                </>
              )}
            </button>
            {saved && (
              <span className="text-body-sm animate-fade-in" style={{ color: "var(--color-success)" }}>
                ✓ Actualizado correctamente
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Info card */}
      <div className="tonal-card p-5">
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "var(--color-surface-container-high)" }}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ color: "var(--color-primary)" }}>photo_camera</span>
          </div>
          <div>
            <p className="text-body-md font-medium mb-1" style={{ color: "var(--color-on-surface)" }}>
              Foto de perfil
            </p>
            <p className="text-body-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              Tu foto se toma automáticamente de tu cuenta de Google o Microsoft.
              Para cambiarla, actualízala desde tu proveedor de identidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
