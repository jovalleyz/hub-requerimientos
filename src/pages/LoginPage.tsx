import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "../hooks/useAuth"

const schema = z.object({
  email:    z.string().email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres"),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")
  const { login, loginWithGoogle } = useAuth()
  const navigate                   = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true); setError("")
    try { await login(data.email, data.password); navigate("/dashboard", { replace: true }) }
    catch { setError("Correo o contrasena incorrectos.") }
    finally { setLoading(false) }
  }

  async function handleGoogle() {
    setLoading(true); setError("")
    try { await loginWithGoogle(); navigate("/dashboard", { replace: true }) }
    catch { setError("Error al iniciar sesion con Google.") }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--color-background)", overflow:"hidden", padding:16 }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(#d3e4fe 0.8px, transparent 0.8px)", backgroundSize:"32px 32px", opacity:0.6, pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:-96, right:-96, width:384, height:384, background:"var(--color-secondary)", borderRadius:"50%", filter:"blur(80px)", opacity:0.1, pointerEvents:"none" }} />

      <div style={{ position:"relative", width:"100%", maxWidth:448 }} className="animate-slide-up">
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, background:"var(--color-unit-navy)", borderRadius:16, marginBottom:16, boxShadow:"0 8px 24px rgba(0,33,105,0.3)" }}>
            <span className="material-symbols-outlined" style={{ color:"white", fontSize:28 }}>shield_with_heart</span>
          </div>
          <h1 className="text-headline-md">InsurTech Pro</h1>
          <p className="text-body-md" style={{ color:"var(--color-on-surface-variant)", marginTop:4 }}>Gestion de requerimientos UNIT</p>
        </div>

        <div className="glass-card" style={{ padding:32, boxShadow:"0 16px 48px rgba(15,23,42,0.12)" }}>
          <h2 className="text-headline-sm" style={{ marginBottom:24 }}>Iniciar sesion</h2>

          {error && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:12, marginBottom:16, background:"var(--color-error-container)", borderRadius:12, fontSize:14, color:"var(--color-error)" }}>
              <span className="material-symbols-outlined" style={{ fontSize:18 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label className="text-label-md" style={{ color:"var(--color-on-surface-variant)", display:"block", marginBottom:6 }}>Correo electronico</label>
              <div style={{ position:"relative" }}>
                <span className="material-symbols-outlined" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:20, color:"var(--color-on-surface-variant)" }}>mail</span>
                <input type="email" placeholder="tu@correo.com" {...register("email")}
                  style={{ width:"100%", paddingLeft:44, paddingRight:16, paddingTop:12, paddingBottom:12, fontSize:14, background:"rgba(255,255,255,0.6)", border:`1px solid ${errors.email ? "var(--color-error)" : "var(--color-outline-variant)"}`, borderRadius:12, outline:"none", boxSizing:"border-box" }} />
              </div>
              {errors.email && <p style={{ fontSize:12, color:"var(--color-error)", marginTop:4 }}>{errors.email.message}</p>}
            </div>

            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <label className="text-label-md" style={{ color:"var(--color-on-surface-variant)" }}>Contrasena</label>
                <Link to="#" style={{ fontSize:12, color:"var(--color-secondary)", textDecoration:"none" }}>Olvide mi contrasena</Link>
              </div>
              <div style={{ position:"relative" }}>
                <span className="material-symbols-outlined" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:20, color:"var(--color-on-surface-variant)" }}>lock</span>
                <input type={showPass ? "text" : "password"} placeholder="••••••••" {...register("password")}
                  style={{ width:"100%", paddingLeft:44, paddingRight:48, paddingTop:12, paddingBottom:12, fontSize:14, background:"rgba(255,255,255,0.6)", border:`1px solid ${errors.password ? "var(--color-error)" : "var(--color-outline-variant)"}`, borderRadius:12, outline:"none", boxSizing:"border-box" }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", border:"none", background:"transparent", cursor:"pointer", color:"var(--color-on-surface-variant)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize:20 }}>{showPass ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              {errors.password && <p style={{ fontSize:12, color:"var(--color-error)", marginTop:4 }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 16px", background:"var(--color-secondary)", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", opacity:loading ? 0.6 : 1, marginTop:8 }}>
              {loading
                ? <div style={{ width:20, height:20, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%" }} className="animate-spin" />
                : <><span className="material-symbols-outlined" style={{ fontSize:18 }}>login</span> Iniciar sesion</>}
            </button>
          </form>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
            <div style={{ flex:1, height:1, background:"var(--color-outline-variant)" }} />
            <span style={{ fontSize:12, color:"var(--color-on-surface-variant)" }}>O accede con</span>
            <div style={{ flex:1, height:1, background:"var(--color-outline-variant)" }} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <button onClick={handleGoogle} disabled={loading}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 16px", border:"1px solid var(--color-outline-variant)", borderRadius:12, background:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:14, opacity:loading ? 0.6 : 1 }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button disabled={loading}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 16px", border:"1px solid var(--color-outline-variant)", borderRadius:12, background:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:14, opacity:loading ? 0.6 : 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize:18, color:"var(--color-unit-navy)" }}>corporate_fare</span>
              SSO Corp.
            </button>
          </div>

          <p style={{ textAlign:"center", fontSize:14, color:"var(--color-on-surface-variant)", marginTop:24 }}>
            No tienes cuenta?{" "}
            <Link to="/register" style={{ color:"var(--color-secondary)", textDecoration:"none", fontWeight:500 }}>Registrate</Link>
          </p>
        </div>

        <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:24 }}>
          {["Privacidad","Terminos","Seguridad"].map((t) => (
            <Link key={t} to="#" style={{ fontSize:12, color:"var(--color-on-surface-variant)", textDecoration:"none" }}>{t}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
