import type { Requirement } from "../../types/index"

interface Props { urgent: Requirement[] }

const priorityColors: Record<string, string> = {
  CRITICAL: "var(--color-error)",
  HIGH:     "#e65100",
  MEDIUM:   "var(--color-secondary)",
  LOW:      "var(--color-on-surface-variant)",
}

const priorityLabels: Record<string, string> = {
  CRITICAL: "Crítico", HIGH: "Alto", MEDIUM: "Medio", LOW: "Bajo",
}

function daysLeft(deadline?: string) {
  if (!deadline) return null
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function ActivityFeed({ urgent }: Props) {
  return (
    <div>
      {urgent.length === 0 ? (
        <div style={{ textAlign:"center", padding:"32px 0", color:"var(--color-on-surface-variant)" }}>
          <span className="material-symbols-outlined" style={{ fontSize:40, opacity:0.3, display:"block", marginBottom:8 }}>task_alt</span>
          <p className="text-body-md">Sin alertas urgentes</p>
          <p className="text-body-sm" style={{ marginTop:4, opacity:0.6 }}>Todo al día</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {urgent.map(r => {
            const days = daysLeft(r.deadline)
            return (
              <div key={r.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:12, borderRadius:12, background:"var(--color-surface-container-low)", borderLeft:`3px solid ${priorityColors[r.priority] ?? "var(--color-outline-variant)"}` }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p className="text-body-md" style={{ color:"var(--color-on-surface)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.title}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                    <span style={{ fontSize:11, fontWeight:600, color: priorityColors[r.priority], textTransform:"uppercase", letterSpacing:"0.05em" }}>
                      {priorityLabels[r.priority]}
                    </span>
                    <span style={{ fontSize:11, color:"var(--color-on-surface-variant)" }}>·</span>
                    <span style={{ fontSize:11, color:"var(--color-on-surface-variant)" }}>{r.productLine}</span>
                  </div>
                </div>
                {days !== null && (
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <span style={{ fontSize:12, fontWeight:700, color: days <= 1 ? "var(--color-error)" : days <= 3 ? "#e65100" : "var(--color-on-surface-variant)" }}>
                      {days === 0 ? "Hoy" : days < 0 ? "Vencido" : `${days}d`}
                    </span>
                    <p style={{ fontSize:10, color:"var(--color-on-surface-variant)", marginTop:2 }}>deadline</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
