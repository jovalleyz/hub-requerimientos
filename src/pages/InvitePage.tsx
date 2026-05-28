import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isSignInWithEmailLink } from "firebase/auth"
import { auth } from "../services/firebase"
import { useAuth } from "../hooks/useAuth"

export default function InvitePage() {
  const { acceptInviteLink } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]     = useState(window.localStorage.getItem("inviteEmail") ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [needEmail, setNeedEmail] = useState(!window.localStorage.getItem("inviteEmail"))

  const isValidLink = isSignInWithEmailLink(auth, window.location.href)

  useEffect(() => {
    if (!isValidLink) {
      navigate("/login", { replace: true })
    }
  }, [isValidLink, navigate])

  async function handleAccept() {
    if (!email) { setNeedEmail(true); return }
    setLoading(true); setError("")
    try {
      await acceptInviteLink(email)
      window.localStorage.removeItem("inviteEmail")
      navigate("/onboarding", { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === "auth/invalid-action-code") setError("El enlace expiró o ya fue usado. Solicita una nueva invitación.")
      else if (code === "auth/invalid-email") setError("El correo no coincide con el enlace de invitación.")
      else setError("No se pudo completar el acceso. Intenta nuevamente.")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--color-background)", padding:16 }}>
      <div style={{ width:"100%", maxWidth:400 }} className="animate-slide-up">
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img src="/logo-unit.png" alt="UNIT S.A." style={{ height:64, width:"auto", marginBottom:16, objectFit:"contain" }} />
          <h1 className="text-headline-md">Aceptar invitación</h1>
          <p className="text-body-md" style={{ color:"var(--color-on-surface-variant)", marginTop:4 }}>
            Completa tu acceso al Hub de Requerimientos UNIT
          </p>
        </div>

        <div className="glass-card" style={{ padding:28, boxShadow:"0 16px 48px rgba(15,23,42,0.12)" }}>
          {error && (
            <div style={{ display:"flex", gap:8, padding:12, marginBottom:16, background:"var(--color-error-container)", borderRadius:12, fontSize:14, color:"var(--color-error)" }}>
              <span className="material-symbols-outlined" style={{ fontSize:18 }}>error</span>{error}
            </div>
          )}

          {needEmail && (
            <div style={{ marginBottom:16 }}>
              <label className="text-label-md" style={{ display:"block", color:"var(--color-on-surface-variant)", marginBottom:6 }}>
                Confirma tu correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                style={{ width:"100%", padding:"11px 14px", fontSize:14, background:"var(--color-surface)", border:"1px solid var(--color-outline-variant)", borderRadius:10, outline:"none", boxSizing:"border-box" }}
              />
              <p style={{ fontSize:12, color:"var(--color-on-surface-variant)", marginTop:4 }}>
                Ingresa el mismo correo al que llegó la invitación.
              </p>
            </div>
          )}

          <button onClick={handleAccept} disabled={loading || !email}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"12px 16px", background:"var(--color-secondary)", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", opacity:(loading || !email) ? 0.6 : 1 }}>
            {loading
              ? <div style={{ width:20, height:20, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%" }} className="animate-spin" />
              : <><span className="material-symbols-outlined" style={{ fontSize:18 }}>login</span> Activar cuenta</>}
          </button>
        </div>
      </div>
    </div>
  )
}
