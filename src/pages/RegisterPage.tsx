import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "../hooks/useAuth"

const schema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName:  z.string().min(2, "Mínimo 2 caracteres"),
  company:   z.string().min(2, "Requerido"),
  email:     z.string().email("Correo inválido"),
  password:  z.string().min(6, "Mínimo 6 caracteres"),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const { register: regUser }   = useAuth()
  const navigate                 = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true); setError("")
    try { await regUser(data.email, data.password, `${data.firstName} ${data.lastName}`); navigate("/dashboard", { replace: true }) }
    catch { setError("Error al crear la cuenta.") }
    finally { setLoading(false) }
  }

  const inputStyle = (hasError: boolean) => ({
    width:"100%", paddingLeft:44, paddingRight:16, paddingTop:12, paddingBottom:12, fontSize:14,
    background:"rgba(255,255,255,0.6)", border:`1px solid ${hasError ? "var(--color-error)" : "var(--color-outline-variant)"}`,
    borderRadius:12, outline:"none", boxSizing:"border-box" as const,
  })

  return (
    <div style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--color-background)", overflow:"hidden", padding:16 }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(#d3e4fe 0.8px, transparent 0.8px)", backgroundSize:"32px 32px", opacity:0.6, pointerEvents:"none" }} />
      <div style={{ position:"relative", width:"100%", maxWidth:448 }} className="animate-slide-up">
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, background:"var(--color-unit-navy)", borderRadius:16, marginBottom:16 }}>
            <span className="material-symbols-outlined" style={{ color:"white", fontSize:28 }}>shield_with_heart</span>
          </div>
          <h1 className="text-headline-md">Crear cuenta</h1>
          <p className="text-body-md" style={{ color:"var(--color-on-surface-variant)", marginTop:4 }}>InsurTech Pro - UNIT S.A.</p>
        </div>
        <div className="glass-card" style={{ padding:32, boxShadow:"0 16px 48px rgba(15,23,42,0.12)" }}>
          {error && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:12, marginBottom:16, background:"var(--color-error-container)", borderRadius:12, fontSize:14, color:"var(--color-error)" }}>
              <span className="material-symbols-outlined" style={{ fontSize:18 }}>error</span>{error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label className="text-label-md" style={{ color:"var(--color-on-surface-variant)", display:"block", marginBottom:6 }}>Nombre</label>
                <input type="text" placeholder="Juan" {...register("firstName")} style={{ width:"100%", padding:"12px 16px", fontSize:14, background:"rgba(255,255,255,0.6)", border:`1px solid ${errors.firstName ? "var(--color-error)" : "var(--color-outline-variant)"}`, borderRadius:12, outline:"none", boxSizing:"border-box" }} />
                {errors.firstName && <p style={{ fontSize:12, color:"var(--color-error)", marginTop:4 }}>{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-label-md" style={{ color:"var(--color-on-surface-variant)", display:"block", marginBottom:6 }}>Apellido</label>
                <input type="text" placeholder="Pérez" {...register("lastName")} style={{ width:"100%", padding:"12px 16px", fontSize:14, background:"rgba(255,255,255,0.6)", border:`1px solid ${errors.lastName ? "var(--color-error)" : "var(--color-outline-variant)"}`, borderRadius:12, outline:"none", boxSizing:"border-box" }} />
                {errors.lastName && <p style={{ fontSize:12, color:"var(--color-error)", marginTop:4 }}>{errors.lastName.message}</p>}
              </div>
            </div>
            {[
              { name:"company",  icon:"domain", label:"Empresa",              type:"text",  placeholder:"UNIT S.A." },
              { name:"email",    icon:"mail",   label:"Correo electrónico",   type:"email", placeholder:"tu@correo.com" },
            ].map(({ name, icon, label, type, placeholder }) => (
              <div key={name}>
                <label className="text-label-md" style={{ color:"var(--color-on-surface-variant)", display:"block", marginBottom:6 }}>{label}</label>
                <div style={{ position:"relative" }}>
                  <span className="material-symbols-outlined" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:20, color:"var(--color-on-surface-variant)" }}>{icon}</span>
                  <input type={type} placeholder={placeholder} {...register(name as "company" | "email")} style={inputStyle(!!(errors as Record<string,unknown>)[name])} />
                </div>
              </div>
            ))}
            <div>
              <label className="text-label-md" style={{ color:"var(--color-on-surface-variant)", display:"block", marginBottom:6 }}>Contraseña</label>
              <div style={{ position:"relative" }}>
                <span className="material-symbols-outlined" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:20, color:"var(--color-on-surface-variant)" }}>lock</span>
                <input type={showPass ? "text" : "password"} placeholder="••••••••" {...register("password")} style={inputStyle(!!errors.password)} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", border:"none", background:"transparent", cursor:"pointer", color:"var(--color-on-surface-variant)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize:20 }}>{showPass ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              {errors.password && <p style={{ fontSize:12, color:"var(--color-error)", marginTop:4 }}>{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 16px", background:"var(--color-secondary)", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", opacity:loading ? 0.6 : 1, marginTop:8 }}>
              {loading
                ? <div style={{ width:20, height:20, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%" }} className="animate-spin" />
                : <><span className="material-symbols-outlined" style={{ fontSize:18 }}>person_add</span> Crear cuenta</>}
            </button>
          </form>
          <p style={{ textAlign:"center", fontSize:14, color:"var(--color-on-surface-variant)", marginTop:24 }}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" style={{ color:"var(--color-secondary)", textDecoration:"none", fontWeight:500 }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
