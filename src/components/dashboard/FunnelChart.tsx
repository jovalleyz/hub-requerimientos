import { useEffect, useRef } from "react"
import type { RequirementStatus } from "../../types/index"

interface Props {
  byStatus: Partial<Record<RequirementStatus, number>>
  total:    number
}

const STAGES: { label: string; key: RequirementStatus; color: string }[] = [
  { label: "Backlog",      key: "BACKLOG",      color: "#44546f" },
  { label: "Análisis",    key: "ANALYSIS",     color: "#7C3AED" },
  { label: "En Proceso",  key: "IN_PROGRESS",  color: "#0058be" },
  { label: "Revisión",    key: "REVIEW",       color: "#D97706" },
  { label: "Completado",  key: "COMPLETED",    color: "#1a7f1a" },
]

export default function FunnelChart({ byStatus, total }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const stages = STAGES.map(s => ({
    ...s,
    count: byStatus[s.key] ?? 0,
    pct:   total > 0 ? ((byStatus[s.key] ?? 0) / total) * 100 : 0,
  }))

  useEffect(() => {
    const bars = ref.current?.querySelectorAll<HTMLDivElement>(".funnel-bar")
    if (!bars) return
    bars.forEach(bar => {
      const target = bar.dataset.pct ?? "0"
      bar.style.width = "0%"
      setTimeout(() => {
        bar.style.transition = "width 0.8s ease"
        bar.style.width = `${Math.max(parseFloat(target), 4)}%`
      }, 200)
    })
  }, [byStatus])

  return (
    <div ref={ref}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stages.map(s => (
          <div key={s.key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span className="text-body-md" style={{ color: "var(--color-on-surface)" }}>{s.label}</span>
              <span className="text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>{s.count}</span>
            </div>
            <div style={{ height: 10, borderRadius: 9999, background: "var(--color-surface-container)", overflow: "hidden", position: "relative" }}>
              <div
                className="funnel-bar"
                data-pct={s.pct}
                style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "0%", background: s.color, borderRadius: 9999 }}
              />
            </div>
          </div>
        ))}
      </div>

      {total === 0 && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-on-surface-variant)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.3, display: "block", marginBottom: 8 }}>funnel</span>
          <p className="text-body-md">Sin requerimientos aún</p>
        </div>
      )}
    </div>
  )
}
