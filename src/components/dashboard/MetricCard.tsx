interface Props {
  label:     string
  value:     number | string
  icon:      string
  iconColor?: string
  trend?:    { value: number; label: string }
  accent?:   "default" | "error" | "success" | "warning"
}

const accentMap = {
  default: { icon: "var(--color-secondary)",         bg: "var(--color-surface-container-high)" },
  error:   { icon: "var(--color-error)",             bg: "var(--color-error-container)" },
  success: { icon: "var(--color-success)",           bg: "var(--color-success-container)" },
  warning: { icon: "var(--color-warning)",           bg: "var(--color-warning-container)" },
}

export default function MetricCard({ label, value, icon, trend, accent = "default" }: Props) {
  const colors = accentMap[accent]

  return (
    <div className="tonal-card animate-fade-in" style={{ padding: 20, borderLeft: accent !== "default" ? `4px solid ${colors.icon}` : undefined }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
        <p className="text-label-md" style={{ color:"var(--color-on-surface-variant)", maxWidth:120 }}>{label}</p>
        <div style={{ width:36, height:36, borderRadius:10, background:colors.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <span className="material-symbols-outlined" style={{ fontSize:20, color:colors.icon }}>{icon}</span>
        </div>
      </div>

      <p className="text-display-lg" style={{ color:"var(--color-on-surface)", lineHeight:1 }}>{value}</p>

      {trend && (
        <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:8 }}>
          <span className="material-symbols-outlined" style={{ fontSize:16, color: trend.value >= 0 ? "var(--color-success)" : "var(--color-error)" }}>
            {trend.value >= 0 ? "trending_up" : "trending_down"}
          </span>
          <span className="text-body-sm" style={{ color:"var(--color-on-surface-variant)" }}>
            {trend.value >= 0 ? "+" : ""}{trend.value} {trend.label}
          </span>
        </div>
      )}
    </div>
  )
}
