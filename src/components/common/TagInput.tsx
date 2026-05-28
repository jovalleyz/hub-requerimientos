import { useState, useRef, useEffect } from "react"

interface Props {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  maxTags?: number
}

const TAG_COLORS = [
  "#0058be","#7C3AED","#D97706","#0891b2","#be185d","#1a7f1a","#c2410c",
]

function tagColor(tag: string) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

export default function TagInput({ value, onChange, suggestions = [], placeholder = "Agregar etiqueta…", maxTags = 10 }: Props) {
  const [input, setInput]         = useState("")
  const [focused, setFocused]     = useState(false)
  const [hiSugg, setHiSugg]       = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = input.length >= 1
    ? suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)).slice(0, 6)
    : []

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase().replace(/\s+/g, "-")
    if (!t || value.includes(t) || value.length >= maxTags) return
    onChange([...value, t])
    setInput("")
    setHiSugg(-1)
  }

  function removeTag(tag: string) {
    onChange(value.filter(t => t !== tag))
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input) {
      e.preventDefault()
      if (hiSugg >= 0 && filtered[hiSugg]) { addTag(filtered[hiSugg]); return }
      addTag(input)
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setHiSugg(h => Math.min(h + 1, filtered.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHiSugg(h => Math.max(h - 1, -1)) }
    if (e.key === "Escape")    { setInput(""); setFocused(false) }
  }

  useEffect(() => { setHiSugg(-1) }, [input])

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
          padding: "6px 10px", borderRadius: 12,
          border: `1px solid ${focused ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
          background: "var(--color-surface)", cursor: "text", minHeight: 42,
          transition: "border-color 0.15s",
        }}
      >
        {value.map(tag => {
          const c = tagColor(tag)
          return (
            <span key={tag} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 10px 2px 8px", borderRadius: 999,
              background: c + "18", color: c, fontSize: 12, fontWeight: 600,
              border: `1px solid ${c}33`,
            }}>
              <span style={{ fontSize: 10 }}>#</span>{tag}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeTag(tag) }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: c, fontSize: 14, marginLeft: 2 }}
              >×</button>
            </span>
          )
        })}
        {value.length < maxTags && (
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => { setTimeout(() => setFocused(false), 150) }}
            placeholder={value.length === 0 ? placeholder : ""}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, color: "var(--color-on-surface)", flex: 1, minWidth: 120,
            }}
          />
        )}
      </div>

      {focused && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "var(--color-surface)", border: "1px solid var(--color-outline-variant)",
          borderRadius: 10, boxShadow: "0 6px 24px rgba(15,23,42,.12)", overflow: "hidden",
        }}>
          {filtered.map((s, i) => (
            <button key={s} type="button"
              onMouseDown={() => addTag(s)}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                padding: "8px 12px", border: "none", cursor: "pointer", textAlign: "left",
                background: hiSugg === i ? "var(--color-surface-container)" : "transparent",
                fontSize: 13, color: "var(--color-on-surface)",
              }}
            >
              <span style={{ fontSize: 10, color: "var(--color-on-surface-variant)" }}>#</span>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
