import { useRef, useCallback } from "react"
import { useUiStore } from "../../store/uiStore"
import { useAuthStore } from "../../store/authStore"
import SearchResults from "./SearchResults"

export default function TopNav() {
  const { unreadCount, toggleNotifications, searchQuery, searchOpen, setSearchQuery, setSearchOpen } = useUiStore()
  const { user, activeTenant } = useAuthStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchOpen(value.length >= 2), 300)
  }, [setSearchQuery, setSearchOpen])

  return (
    <header style={{ display:"flex", alignItems:"center", gap:12, padding:"0 24px", height:64, background:"var(--color-surface)", borderBottom:"1px solid var(--color-outline-variant)", flexShrink:0, position:"sticky", top:0, zIndex:40 }}>
      <div style={{ flex:1, maxWidth:400 }}>
        <div style={{ position:"relative" }}>
          <span className="material-symbols-outlined" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:20, color:"var(--color-on-surface-variant)", zIndex:1 }}>search</span>
          <input
            type="search"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
            placeholder="Buscar requerimientos..."
            style={{ width:"100%", paddingLeft:42, paddingRight:16, paddingTop:8, paddingBottom:8, fontSize:14, background:"var(--color-surface-container-low)", border:"1px solid var(--color-outline-variant)", borderRadius:12, outline:"none" }}
          />
          {searchOpen && <SearchResults />}
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
        <span style={{ fontSize:14, color:"var(--color-on-surface-variant)", padding:"6px 12px", background:"var(--color-surface-container-low)", borderRadius:8, border:"1px solid var(--color-outline-variant)" }}>
          {activeTenant?.name ?? "Sin tenant"}
        </span>
        <button onClick={toggleNotifications} style={{ position:"relative", padding:8, border:"none", borderRadius:12, background:"transparent", cursor:"pointer", color:"var(--color-on-surface-variant)" }}>
          <span className="material-symbols-outlined" style={{ fontSize:22 }}>notifications</span>
          {unreadCount > 0 && (
            <span style={{ position:"absolute", top:4, right:4, minWidth:18, height:18, padding:"0 4px", background:"var(--color-error)", color:"white", fontSize:10, fontWeight:700, borderRadius:9999, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:4 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--color-secondary)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:14, fontWeight:600 }}>
            {user?.displayName?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <span style={{ fontSize:14, color:"var(--color-on-surface)", maxWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {user?.displayName ?? "Usuario"}
          </span>
        </div>
      </div>
    </header>
  )
}
