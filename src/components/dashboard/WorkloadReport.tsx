import { useMemo } from "react"
import type { Requirement } from "@/types"
import { useTenantMembers } from "@/hooks/useTenantMembers"

interface Props { requirements: Requirement[] }

interface UserLoad {
  uid: string
  displayName: string
  photoURL?: string
  total: number
  completed: number
  inProgress: number
  pct: number
}

const AVATAR_COLORS = ["#0058be","#7C3AED","#D97706","#0891b2","#be185d","#1a7f1a"]

export default function WorkloadReport({ requirements }: Props) {
  const { data: members = [] } = useTenantMembers()

  const loads: UserLoad[] = useMemo(() => {
    const map = new Map<string, { total: number; completed: number; inProgress: number }>()

    for (const r of requirements) {
      for (const uid of r.assignedTo ?? []) {
        const cur = map.get(uid) ?? { total: 0, completed: 0, inProgress: 0 }
        cur.total++
        if (r.status === "COMPLETED") cur.completed++
        else if (r.status === "IN_PROGRESS" || r.status === "REVIEW" || r.status === "ANALYSIS") cur.inProgress++
        map.set(uid, cur)
      }
    }

    return [...map.entries()].map(([uid, counts]) => {
      const m = members.find(u => u.uid === uid)
      return {
        uid,
        displayName: m?.displayName ?? uid.slice(0, 8),
        photoURL: m?.photoURL,
        ...counts,
        pct: counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0,
      }
    }).sort((a, b) => b.total - a.total)
  }, [requirements, members])

  if (loads.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-on-surface-variant)" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.3, display: "block", marginBottom: 8 }}>group</span>
        <p style={{ fontSize: 13 }}>Sin asignaciones registradas</p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {loads.map((u, i) => {
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
        const initials = u.displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
        return (
          <div key={u.uid} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: u.photoURL ? "transparent" : color,
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}>
              {u.photoURL
                ? <img src={u.photoURL} alt={u.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{initials}</span>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>
                  {u.displayName}
                </span>
                <span style={{ fontSize: 11, color: "var(--color-on-surface-variant)", flexShrink: 0, marginLeft: 8 }}>
                  {u.completed}/{u.total} · {u.pct}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 9999, background: "var(--color-surface-container)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 9999,
                  width: `${u.pct}%`,
                  background: u.pct === 100 ? "#1a7f1a" : u.pct >= 50 ? "#0058be" : "#D97706",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              {u.inProgress > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "#dce9ff", color: "#0058be" }}>
                  {u.inProgress} activos
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
