import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { auth } from "@/services/firebase"

export default function EmailVerificationBanner() {
  const { resendVerificationEmail } = useAuth()
  const [sent, setSent]       = useState(false)
  const [hidden, setHidden]   = useState(false)

  const fbUser = auth.currentUser
  if (!fbUser || fbUser.emailVerified || hidden) return null

  async function handleResend() {
    await resendVerificationEmail()
    setSent(true)
  }

  return (
    <div style={{
      display:"flex", alignItems:"center", gap:12, padding:"10px 20px",
      background:"#FFF3CD", borderBottom:"1px solid #FFCA2C",
      fontSize:13, color:"#664D03", flexShrink:0,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize:18, color:"#CC8800" }}>mark_email_unread</span>
      <span style={{ flex:1 }}>
        Verifica tu correo <strong>{fbUser.email}</strong> para activar todas las funciones.
      </span>
      {sent ? (
        <span style={{ color:"#1a7f1a", fontWeight:600 }}>¡Enviado!</span>
      ) : (
        <button onClick={handleResend}
          style={{ padding:"4px 12px", borderRadius:8, border:"1px solid #FFCA2C", background:"white", cursor:"pointer", fontSize:12, fontWeight:600, color:"#664D03" }}>
          Reenviar
        </button>
      )}
      <button onClick={() => setHidden(true)}
        style={{ border:"none", background:"transparent", cursor:"pointer", color:"#664D03", lineHeight:1, padding:4 }}>
        <span className="material-symbols-outlined" style={{ fontSize:16 }}>close</span>
      </button>
    </div>
  )
}
