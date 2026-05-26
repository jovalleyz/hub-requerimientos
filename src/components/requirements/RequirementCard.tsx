import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Requirement } from "../../types/index"

interface Props {
  requirement: Requirement
  onClick?:    (r: Requirement) => void
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  CRITICAL: { label: "Crítico", color: "#ba1a1a", bg: "#ffdad6" },
  HIGH:     { label: "Alto",    color: "#e65100", bg: "#fff3e0" },
  MEDIUM:   { label: "Medio",   color: "#0058be", bg: "#dce9ff" },
  LOW:      { label: "Bajo",    color: "#44546f", bg: "#e8edf5" },
}

const productLineColors: Record<string, string> = {
  LIFE:       "#1a7f1a",
  AUTO:       "#7b1fa2",
  HEALTH:     "#0058be",
  HOME:       "#c17d00",
  COMMERCIAL: "#e65100",
  PLATFORM:   "#006874",
  GENERAL:    "#44546f",
}

const productLineLabels: Record<string, string> = {
  LIFE: "Vida", AUTO: "Auto", HEALTH: "Salud",
  HOME: "Hogar", COMMERCIAL: "Empresarial", PLATFORM: "Plataforma", GENERAL: "General",
}

function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
  const hue = name.charCodeAt(0) * 37 % 360
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},55%,45%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontSize: size * 0.38, fontWeight: 700,
      border: "2px solid white",
    }}>{initials}</div>
  )
}

export default function RequirementCard({ requirement: r, onClick }: Props) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: r.id, data: { requirement: r } })

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.45 : 1,
    rotate:     isDragging ? "2deg" : "0deg",
    scale:      isDragging ? "1.04" : "1",
    cursor:     isDragging ? "grabbing" : "grab",
    zIndex:     isDragging ? 999 : "auto" as const,
  }

  const p      = priorityConfig[r.priority] ?? priorityConfig.MEDIUM
  const pct    = r.taskCount ? Math.round((r.completedTaskCount ?? 0) / r.taskCount * 100) : 0
  const plColor = productLineColors[r.productLine] ?? "#44546f"
  const plLabel = productLineLabels[r.productLine] ?? r.productLine

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClick?.(r)}
      className="glass-card animate-slide-up"
      {...attributes}
    >
      <div style={{ padding: "12px 14px" }}>
        {/* Top row: badge + drag handle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
            padding: "3px 8px", borderRadius: 9999, background: p.bg, color: p.color,
          }}>{p.label}</span>
          <span
            className="material-symbols-outlined"
            {...listeners}
            style={{ fontSize: 18, color: "var(--color-on-surface-variant)", cursor: "grab", touchAction: "none" }}
            onClick={e => e.stopPropagation()}
          >drag_indicator</span>
        </div>

        {/* Code + Title */}
        {r.code && (
          <p style={{ fontSize: 10, color: "var(--color-on-surface-variant)", fontWeight: 600, marginBottom: 2 }}>
            #{r.code}
          </p>
        )}
        <p style={{
          fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)",
          lineHeight: 1.4, marginBottom: 6,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{r.title}</p>

        {/* Description */}
        {r.description && (
          <p style={{
            fontSize: 12, color: "var(--color-on-surface-variant)", lineHeight: 1.5, marginBottom: 10,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{r.description}</p>
        )}

        {/* Product line tag */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: plColor, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "var(--color-on-surface-variant)", fontWeight: 500 }}>{plLabel}</span>
        </div>

        {/* Progress bar */}
        {r.taskCount && r.taskCount > 0 ? (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: "var(--color-on-surface-variant)" }}>Tareas</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>
                {r.completedTaskCount ?? 0}/{r.taskCount}
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 9999, background: "var(--color-surface-container)", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`, borderRadius: 9999,
                background: pct === 100 ? "var(--color-success)" : "var(--color-secondary)",
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        ) : null}

        {/* Footer: avatars + deadline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex" }}>
            {r.assignedTo.slice(0, 3).map((uid, i) => (
              <div key={uid} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                <Avatar name={uid} size={22} />
              </div>
            ))}
            {r.assignedTo.length > 3 && (
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "var(--color-surface-container)", border: "2px solid white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "var(--color-on-surface-variant)", marginLeft: -8,
              }}>
                +{r.assignedTo.length - 3}
              </div>
            )}
          </div>

          {r.deadline && (
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                calendar_today
              </span>
              <span style={{ fontSize: 11, color: "var(--color-on-surface-variant)" }}>
                {new Date(r.deadline).toLocaleDateString("es-DO", { day: "2-digit", month: "short" })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
