import { useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useUiStore } from "../../store/uiStore"
import { useAuthStore } from "../../store/authStore"
import SearchResults from "./SearchResults"

export default function TopNav() {
  const { unreadCount, toggleNotifications, searchQuery, searchOpen, setSearchQuery, setSearchOpen } = useUiStore()
  const { user, activeTenant } = useAuthStore()
  const navigate = useNavigate()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchOpen(value.length >= 2), 300)
  }, [setSearchQuery, setSearchOpen])

  const initials = (user?.displayName ?? "U")
    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()

  return (
    <header style={{
      display: "flex", alignItems: "center", gap: 12, padding: "0 24px", height: 64,
      background: "var(--color-surface)", borderBottom: "1px solid var(--color-outline-variant)",
      flexShrink: 0, position: "sticky", top: 0, zIndex: 40,
      boxShadow: "0 1px 3px rgba(11,28,48,0.05)",
    }}>
      {/* Search bar */}
      <div style={{ flex: 1, maxWidth: 440 }}>
        <div style={{ position: "relative" }}>
          <span className="material-symbols-outlined" style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 18, color: "var(--color-on-surface-variant)", zIndex: 1,
          }}>search</span>
          <input
            type="search"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
            placeholder="Buscar requerimientos..."
            style={{
              width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 9, paddingBottom: 9,
              fontSize: 14, background: "var(--color-surface-container-low)",
              border: "1.5px solid var(--color-outline-variant)",
              borderRadius: 12, outline: "none", transition: "border-color 0.15s",
            }}
            onFocus={e => { e.target.style.borderColor = "var(--color-primary)"; searchQuery.length >= 2 && setSearchOpen(true); }}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"}
          />
          {searchOpen && <SearchResults />}
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
        {/* Tenant badge */}
        {activeTenant && (
          <span style={{
            fontSize: 13, fontWeight: 500, color: "var(--color-on-surface-variant)",
            padding: "5px 12px", background: "var(--color-surface-container-low)",
            borderRadius: 8, border: "1px solid var(--color-outline-variant)",
          }}>
            {activeTenant.name}
          </span>
        )}

        {/* Notifications */}
        <button
          onClick={toggleNotifications}
          style={{
            position: "relative", width: 36, height: 36, border: "none", borderRadius: 10,
            background: "transparent", cursor: "pointer", color: "var(--color-on-surface-variant)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--color-surface-container-low)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4, minWidth: 16, height: 16,
              padding: "0 3px", background: "var(--color-error)", color: "white",
              fontSize: 9, fontWeight: 700, borderRadius: 9999,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Profile button */}
        <button
          onClick={() => navigate("/profile")}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px",
            border: "1.5px solid var(--color-outline-variant)", borderRadius: 12,
            background: "transparent", cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--color-surface-container-low)"; e.currentTarget.style.borderColor = "var(--color-primary)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--color-outline-variant)"; }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "var(--color-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <span style={{
            fontSize: 13, fontWeight: 500, color: "var(--color-on-surface)",
            maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {user?.displayName ?? "Usuario"}
          </span>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)" }}>
            expand_more
          </span>
        </button>
      </div>
    </header>
  )
}
