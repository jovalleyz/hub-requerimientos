export default function OnboardingPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-headline-md" style={{ marginBottom:24 }}>Configuracion de Marca</h1>
      <div className="tonal-card" style={{ padding:24, display:"flex", alignItems:"center", justifyContent:"center", height:256 }}>
        <div style={{ textAlign:"center", color:"var(--color-on-surface-variant)" }}>
          <span className="material-symbols-outlined" style={{ fontSize:48, opacity:0.3, display:"block", marginBottom:8 }}>palette</span>
          <p className="text-body-md">Onboarding y Branding — Sprint 8</p>
        </div>
      </div>
    </div>
  )
}
