import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

const navItems = [
  { to: "/dashboard",     icon: "dashboard",            label: "Dashboard" },
  { to: "/requirements",  icon: "view_kanban",          label: "Pipeline" },
  { to: "/projects",      icon: "account_tree",         label: "Proyectos" },
  { to: "/admin/tenants", icon: "admin_panel_settings", label: "Admin" },
  { to: "/profile",       icon: "person",               label: "Mi perfil" },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  return (
    <aside className="hidden lg:flex" style={{
      width: 280, height: "100vh", background: "var(--color-surface)",
      borderRight: "1px solid var(--color-outline-variant)", flexShrink: 0,
      flexDirection: "column",
    }}>
      <div style={{ display:"flex", alignItems:"center", padding:"0 20px", height:64, borderBottom:"1px solid var(--color-outline-variant)" }}>
        <img src="/logo-unit.png" alt="UNIT S.A." style={{ height:36, width:"auto", objectFit:"contain" }} />
      </div>
      <div style={{ padding:"12px 16px" }}>
        <NavLink to="/requirements" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 16px", borderRadius:12, background:"var(--color-secondary)", color:"white", textDecoration:"none", fontSize:14, fontWeight:600 }}>
          <span className="material-symbols-outlined" style={{ fontSize:18 }}>add</span>
          Nuevo Requerimiento
        </NavLink>
      </div>
      <nav style={{ flex:1, padding:"8px 12px", overflowY:"auto" }}>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12,
            textDecoration:"none", fontSize:14, marginBottom:4, transition:"background 0.2s",
            background: isActive ? "var(--color-surface-container-high)" : "transparent",
            color: isActive ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
            fontWeight: isActive ? 500 : 400,
          })}>
            <span className="material-symbols-outlined" style={{ fontSize:22 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding:"12px", borderTop:"1px solid var(--color-outline-variant)" }}>
        <button onClick={async () => { await logout(); navigate("/login", { replace: true }) }}
          style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", width:"100%", border:"none", borderRadius:12, background:"transparent", cursor:"pointer", color:"var(--color-error)", fontSize:14 }}>
          <span className="material-symbols-outlined" style={{ fontSize:22 }}>logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
