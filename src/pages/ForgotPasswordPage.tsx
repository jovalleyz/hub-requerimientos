import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../services/firebase"

const schema = z.object({ email: z.string().email("Correo inválido") })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState("")
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true); setError("")
    try {
      await sendPasswordResetEmail(auth, data.email)
      setSent(true)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === "auth/user-not-found") setSent(true) // no revelar si el email existe
      else setError("No se pudo enviar el correo. Intenta nuevamente.")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--color-background)", overflow:"hidden", padding:16 }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(#d3e4fe 0.8px, transparent 0.8px)", backgroundSize:"32px 32px", opacity:0.6, pointerEvents:"none" }} />

      <div style={{ position:"relative", width:"100%", maxWidth:420 }} className="animate-slide-up">
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img src="/logo-unit.png" alt="UNIT S.A." style={{ height:64, width:"auto", marginBottom:16, objectFit:"contain" }} />
          <h1 className="text-headline-md">Recuperar contraseña</h1>
          <p className="text-body-md" style={{ color:"var(--color-on-surface-variant)", marginTop:4 }}>
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <div className="glass-card" style={{ padding:32, boxShadow:"0 16px 48px rgba(15,23,42,0.12)" }}>
          {sent ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"var(--color-secondary)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <span className="material-symbols-outlined" style={{ color:"white", fontSize:32 }}>mark_email_read</span>
              </div>
              <h2 className="text-headline-sm" style={{ marginBottom:8 }}>Correo enviado</h2>
              <p className="text-body-md" style={{ color:"var(--color-on-surface-variant)", marginBottom:24 }}>
                Si <strong>{getValues("email")}</strong> tiene una cuenta, recibirás un enlace en los próximos minutos. Revisa tu carpeta de spam.
              </p>
              <Link to="/login" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", background:"var(--color-secondary)", color:"white", borderRadius:12, textDecoration:"none", fontSize:14, fontWeight:600 }}>
                <span className="material-symbols-outlined" style={{ fontSize:18 }}>arrow_back</span>
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-headline-sm" style={{ marginBottom:24 }}>Ingresa tu correo</h2>

              {error && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:12, marginBottom:16, background:"var(--color-error-container)", borderRadius:12, fontSize:14, color:"var(--color-error)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize:18 }}>error</span>{error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div>
                  <label className="text-label-md" style={{ color:"var(--color-on-surface-variant)", display:"block", marginBottom:6 }}>Correo electrónico</label>
                  <div style={{ position:"relative" }}>
                    <span className="material-symbols-outlined" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:20, color:"var(--color-on-surface-variant)" }}>mail</span>
                    <input type="email" placeholder="tu@correo.com" {...register("email")}
                      style={{ width:"100%", paddingLeft:44, paddingRight:16, paddingTop:12, paddingBottom:12, fontSize:14, background:"rgba(255,255,255,0.6)", border:`1px solid ${errors.email ? "var(--color-error)" : "var(--color-outline-variant)"}`, borderRadius:12, outline:"none", boxSizing:"border-box" }} />
                  </div>
                  {errors.email && <p style={{ fontSize:12, color:"var(--color-error)", marginTop:4 }}>{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={loading}
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 16px", background:"var(--color-secondary)", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", opacity:loading ? 0.6 : 1 }}>
                  {loading
                    ? <div style={{ width:20, height:20, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%" }} className="animate-spin" />
                    : <><span className="material-symbols-outlined" style={{ fontSize:18 }}>send</span> Enviar enlace</>}
                </button>
              </form>

              <p style={{ textAlign:"center", fontSize:14, color:"var(--color-on-surface-variant)", marginTop:24 }}>
                <Link to="/login" style={{ color:"var(--color-secondary)", textDecoration:"none", fontWeight:500, display:"inline-flex", alignItems:"center", gap:4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize:16 }}>arrow_back</span>
                  Volver al inicio de sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
