import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

const navItems = [
  { to: "/dashboard",     icon: "dashboard",            label: "Dashboard" },
  { to: "/requirements",  icon: "view_kanban",          label: "Pipeline" },
  { to: "/projects",      icon: "account_tree",         label: "Proyectos" },
  { to: "/admin/tenants", icon: "admin_panel_settings", label: "Administración" },
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
      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", padding: "0 20px", height: 64,
        borderBottom: "1px solid var(--color-outline-variant)",
      }}>
        <img src="/logo-unit.png" alt="UNIT S.A." style={{ height: 36, width: "auto", objectFit: "contain" }} />
      </div>

      {/* Primary CTA */}
      <div style={{ padding: "16px" }}>
        <NavLink
          to="/requirements"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "11px 16px", borderRadius: 14,
            background: "var(--color-primary)",
            color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600,
            boxShadow: "0 2px 8px rgba(0,88,190,0.30)",
            transition: "opacity 0.15s, transform 0.1s",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Nuevo Requerimiento
        </NavLink>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "4px 12px", overflowY: "auto" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 12,
              textDecoration: "none", fontSize: 14, marginBottom: 2,
              transition: "background 0.15s, color 0.15s",
              background: isActive ? "var(--color-surface-container-high)" : "transparent",
              color: isActive ? "var(--color-primary)" : "var(--color-on-surface-variant)",
              fontWeight: isActive ? 600 : 400,
              borderLeft: isActive ? "3px solid var(--color-primary)" : "3px solid transparent",
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 12px 16px", borderTop: "1px solid var(--color-outline-variant)" }}>
        <button
          onClick={async () => { await logout(); navigate("/login", { replace: true }) }}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", width: "100%", border: "none", borderRadius: 12,
            background: "transparent", cursor: "pointer", fontSize: 14,
            color: "var(--color-on-surface-variant)", transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#ffdad620"; e.currentTarget.style.color = "var(--color-error)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-on-surface-variant)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
