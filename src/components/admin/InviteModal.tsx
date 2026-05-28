import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthStore } from "@/store/authStore"
import { useAuth } from "@/hooks/useAuth"
import { createInvitation } from "@/services/adminService"
import type { UserRole } from "@/types"

const schema = z.object({
  email: z.string().email("Correo inválido"),
  role:  z.enum(["ADMIN", "MANAGER", "DEV", "VIEWER"]),
})
type FormData = z.infer<typeof schema>

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "MANAGER", label: "Manager", desc: "Gestión de requerimientos" },
  { value: "DEV",     label: "Dev",     desc: "Crear y editar" },
  { value: "VIEWER",  label: "Viewer",  desc: "Solo lectura" },
  { value: "ADMIN",   label: "Admin",   desc: "Control total" },
]

interface Props { onClose: () => void }

export default function InviteModal({ onClose }: Props) {
  const { activeTenant, user } = useAuthStore()
  const { sendInviteLink }     = useAuth()
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState("")
  const [done, setDone]        = useState("")

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "VIEWER" },
  })

  async function onSubmit(data: FormData) {
    if (!activeTenant || !user) return
    setLoading(true); setError("")
    try {
      await createInvitation(activeTenant.id, data.email, data.role, user.uid)
      await sendInviteLink(data.email)
      setDone(data.email)
    } catch {
      setError("No se pudo enviar la invitación. Intenta nuevamente.")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(2px)" }} onClick={onClose} />
      <div className="glass-card animate-slide-up" style={{ position:"relative", width:"100%", maxWidth:420, padding:28, boxShadow:"0 24px 64px rgba(15,23,42,0.18)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h2 className="text-headline-sm">Invitar usuario</h2>
          <button onClick={onClose} style={{ border:"none", background:"transparent", cursor:"pointer", color:"var(--color-on-surface-variant)" }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {done ? (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
              <span className="material-symbols-outlined" style={{ color:"#1a7f1a", fontSize:28 }}>mark_email_read</span>
            </div>
            <p className="text-body-md" style={{ fontWeight:600, marginBottom:4 }}>Invitación enviada</p>
            <p className="text-body-sm" style={{ color:"var(--color-on-surface-variant)" }}>
              Se envió un enlace de acceso a <strong>{done}</strong>. Expira en 7 días.
            </p>
            <button onClick={onClose} style={{ marginTop:20, padding:"10px 20px", background:"var(--color-secondary)", color:"white", border:"none", borderRadius:10, fontWeight:600, cursor:"pointer" }}>
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {error && (
              <div style={{ display:"flex", gap:8, padding:10, background:"var(--color-error-container)", borderRadius:10, fontSize:13, color:"var(--color-error)" }}>
                <span className="material-symbols-outlined" style={{ fontSize:16 }}>error</span>{error}
              </div>
            )}

            <div>
              <label className="text-label-md" style={{ color:"var(--color-on-surface-variant)", display:"block", marginBottom:6 }}>Correo electrónico</label>
              <div style={{ position:"relative" }}>
                <span className="material-symbols-outlined" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:18, color:"var(--color-on-surface-variant)" }}>mail</span>
                <input type="email" placeholder="usuario@grupoint.com" {...register("email")}
                  style={{ width:"100%", paddingLeft:36, paddingRight:12, paddingTop:10, paddingBottom:10, fontSize:14, background:"var(--color-surface)", border:`1px solid ${errors.email ? "var(--color-error)" : "var(--color-outline-variant)"}`, borderRadius:10, outline:"none", boxSizing:"border-box" }} />
              </div>
              {errors.email && <p style={{ fontSize:12, color:"var(--color-error)", marginTop:4 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-label-md" style={{ color:"var(--color-on-surface-variant)", display:"block", marginBottom:8 }}>Rol</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {ROLES.map(r => (
                  <label key={r.value} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 12px", border:"1px solid var(--color-outline-variant)", borderRadius:10, cursor:"pointer" }}>
                    <input type="radio" value={r.value} {...register("role")} style={{ marginTop:2 }} />
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:"var(--color-on-surface)" }}>{r.label}</p>
                      <p style={{ fontSize:11, color:"var(--color-on-surface-variant)" }}>{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px 16px", background:"var(--color-secondary)", color:"white", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", opacity:loading ? 0.6 : 1 }}>
              {loading
                ? <div style={{ width:18, height:18, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%" }} className="animate-spin" />
                : <><span className="material-symbols-outlined" style={{ fontSize:18 }}>send</span> Enviar invitación</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
