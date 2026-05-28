import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useUiStore } from "@/store/uiStore"
import { useRequirements } from "@/hooks/useRequirements"

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: "#94a3b8", ANALYSIS: "#f59e0b", IN_PROGRESS: "#3b82f6",
  REVIEW: "#8b5cf6", COMPLETED: "#22c55e", CANCELLED: "#ef4444",
}
const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog", ANALYSIS: "Análisis", IN_PROGRESS: "En progreso",
  REVIEW: "Revisión", COMPLETED: "Completado", CANCELLED: "Cancelado",
}

export default function SearchResults() {
  const { searchQuery, setSearchOpen, setSearchQuery } = useUiStore()
  const { data: requirements = [] } = useRequirements()
  const navigate  = useNavigate()
  const ref       = useRef<HTMLDivElement>(null)

  const q = searchQuery.toLowerCase().trim()
  const results = q.length < 2 ? [] : requirements.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.description?.toLowerCase().includes(q) ||
    r.code?.toLowerCase().includes(q)
  ).slice(0, 8)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [setSearchOpen])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery("") }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [setSearchOpen, setSearchQuery])

  if (q.length < 2) return null

  return (
    <div ref={ref} style={{
      position:"absolute", top:"calc(100% + 8px)", left:0, right:0, zIndex:60,
      background:"var(--color-surface)", border:"1px solid var(--color-outline-variant)",
      borderRadius:14, boxShadow:"0 8px 32px rgba(15,23,42,0.14)", overflow:"hidden",
    }}>
      {results.length === 0 ? (
        <div style={{ padding:"16px 14px", display:"flex", alignItems:"center", gap:8, color:"var(--color-on-surface-variant)", fontSize:13 }}>
          <span className="material-symbols-outlined" style={{ fontSize:18 }}>search_off</span>
          Sin resultados para «{searchQuery}»
        </div>
      ) : (
        <>
          <p style={{ padding:"8px 14px 4px", fontSize:11, color:"var(--color-on-surface-variant)", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" }}>
            {results.length} resultado{results.length !== 1 ? "s" : ""}
          </p>
          {results.map(r => (
            <button key={r.id} onClick={() => {
              navigate(`/requirements/${r.id}`)
              setSearchOpen(false); setSearchQuery("")
            }} style={{
              display:"flex", alignItems:"center", gap:12, width:"100%", padding:"10px 14px",
              border:"none", background:"transparent", cursor:"pointer", textAlign:"left",
              borderTop:"1px solid var(--color-outline-variant)",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span className="material-symbols-outlined" style={{ fontSize:18, color:"var(--color-on-surface-variant)", flexShrink:0 }}>description</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:500, color:"var(--color-on-surface)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.title}</p>
                {r.code && <p style={{ fontSize:11, color:"var(--color-on-surface-variant)" }}>{r.code}</p>}
              </div>
              <span style={{
                fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:99,
                background: STATUS_COLORS[r.status] + "22", color: STATUS_COLORS[r.status], flexShrink:0,
              }}>
                {STATUS_LABELS[r.status] ?? r.status}
              </span>
            </button>
          ))}
        </>
      )}
    </div>
  )
}
