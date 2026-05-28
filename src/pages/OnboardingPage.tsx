import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { doc, updateDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import { db, auth } from "../services/firebase"
import { useAuthStore } from "../store/authStore"

const profileSchema = z.object({
  displayName: z.string().min(2, "Mínimo 2 caracteres"),
  jobTitle:    z.string().optional(),
})
type ProfileData = z.infer<typeof profileSchema>

const STEPS = ["Bienvenida", "Tu perfil", "¡Listo!"]

export default function OnboardingPage() {
  const { user, setUser } = useAuthStore()
  const navigate          = useNavigate()
  const [step, setStep]   = useState(0)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName ?? "", jobTitle: user?.jobTitle ?? "" },
  })

  async function saveProfile(data: ProfileData) {
    if (!user) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      await updateDoc(doc(db, "users", user.uid), {
        displayName: data.displayName,
        jobTitle:    data.jobTitle ?? "",
        onboardingComplete: true,
        updatedAt: now,
      })
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.displayName })
      }
      setUser({ ...user, displayName: data.displayName, jobTitle: data.jobTitle, onboardingComplete: true, updatedAt: now })
      setStep(2)
    } finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--color-background)", padding:16, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(#d3e4fe 0.8px, transparent 0.8px)", backgroundSize:"32px 32px", opacity:0.5, pointerEvents:"none" }} />

      <div style={{ position:"relative", width:"100%", maxWidth:520 }} className="animate-slide-up">
        {/* Steps indicator */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:32 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{
                  width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  background: i < step ? "var(--color-secondary)" : i === step ? "var(--color-unit-navy)" : "var(--color-surface-container)",
                  color: i <= step ? "white" : "var(--color-on-surface-variant)",
                  fontSize:13, fontWeight:700, transition:"all 0.3s",
                }}>
                  {i < step ? <span className="material-symbols-outlined" style={{ fontSize:16 }}>check</span> : i + 1}
                </div>
                <span style={{ fontSize:11, color: i === step ? "var(--color-unit-navy)" : "var(--color-on-surface-variant)", fontWeight: i === step ? 600 : 400 }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width:64, height:2, background: i < step ? "var(--color-secondary)" : "var(--color-outline-variant)", margin:"0 4px", marginBottom:20, transition:"background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding:36, boxShadow:"0 16px 48px rgba(15,23,42,0.12)" }}>

          {/* Step 0: Bienvenida */}
          {step === 0 && (
            <div style={{ textAlign:"center" }}>
              <img src="/logo-unit.png" alt="UNIT S.A." style={{ height:72, width:"auto", marginBottom:24, objectFit:"contain" }} />
              <h1 className="text-headline-md" style={{ marginBottom:12 }}>
                ¡Bienvenido{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-body-md" style={{ color:"var(--color-on-surface-variant)", marginBottom:32, lineHeight:1.6 }}>
                Esta es tu plataforma de gestión de requerimientos de desarrollo.<br />
                Vamos a configurar tu perfil en un momento.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:32 }}>
                {[
                  { icon:"view_kanban", label:"Pipeline Kanban" },
                  { icon:"account_tree", label:"Proyectos" },
                  { icon:"dashboard", label:"Dashboard" },
                ].map(f => (
                  <div key={f.icon} style={{ padding:16, borderRadius:12, background:"var(--color-surface-container-low)", textAlign:"center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize:28, color:"var(--color-secondary)", display:"block", marginBottom:6 }}>{f.icon}</span>
                    <p style={{ fontSize:11, color:"var(--color-on-surface-variant)" }}>{f.label}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)}
                style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", background:"var(--color-secondary)", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                Comenzar
                <span className="material-symbols-outlined" style={{ fontSize:18 }}>arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 1: Perfil */}
          {step === 1 && (
            <form onSubmit={handleSubmit(saveProfile)} style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <h2 className="text-headline-sm" style={{ marginBottom:4 }}>Tu perfil</h2>
                <p className="text-body-sm" style={{ color:"var(--color-on-surface-variant)" }}>Así te verán tus compañeros de equipo.</p>
              </div>

              <div>
                <label className="text-label-md" style={{ display:"block", color:"var(--color-on-surface-variant)", marginBottom:6 }}>Nombre completo</label>
                <input {...register("displayName")}
                  style={{ width:"100%", padding:"11px 14px", fontSize:14, background:"var(--color-surface)", border:`1px solid ${errors.displayName ? "var(--color-error)" : "var(--color-outline-variant)"}`, borderRadius:10, outline:"none", boxSizing:"border-box" }} />
                {errors.displayName && <p style={{ fontSize:12, color:"var(--color-error)", marginTop:4 }}>{errors.displayName.message}</p>}
              </div>

              <div>
                <label className="text-label-md" style={{ display:"block", color:"var(--color-on-surface-variant)", marginBottom:6 }}>
                  Cargo <span style={{ fontSize:11, fontWeight:400 }}>(opcional)</span>
                </label>
                <input {...register("jobTitle")} placeholder="Ej: Desarrollador Senior, Gerente de Proyectos…"
                  style={{ width:"100%", padding:"11px 14px", fontSize:14, background:"var(--color-surface)", border:"1px solid var(--color-outline-variant)", borderRadius:10, outline:"none", boxSizing:"border-box" }} />
              </div>

              <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
                <button type="button" onClick={() => setStep(0)}
                  style={{ padding:"10px 20px", border:"1px solid var(--color-outline-variant)", borderRadius:10, background:"transparent", cursor:"pointer", fontSize:14 }}>
                  Atrás
                </button>
                <button type="submit" disabled={saving}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 24px", background:"var(--color-secondary)", color:"white", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", opacity:saving ? 0.6 : 1 }}>
                  {saving
                    ? <div style={{ width:18, height:18, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%" }} className="animate-spin" />
                    : <>Guardar y continuar <span className="material-symbols-outlined" style={{ fontSize:16 }}>arrow_forward</span></>}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: ¡Listo! */}
          {step === 2 && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,var(--color-secondary),var(--color-unit-navy))", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                <span className="material-symbols-outlined" style={{ color:"white", fontSize:36 }}>celebration</span>
              </div>
              <h2 className="text-headline-md" style={{ marginBottom:8 }}>¡Todo listo!</h2>
              <p className="text-body-md" style={{ color:"var(--color-on-surface-variant)", marginBottom:32 }}>
                Tu perfil está configurado. Ya puedes empezar a gestionar requerimientos con tu equipo.
              </p>
              <button onClick={() => navigate("/dashboard", { replace: true })}
                style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", background:"var(--color-secondary)", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                <span className="material-symbols-outlined" style={{ fontSize:18 }}>dashboard</span>
                Ir al Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
