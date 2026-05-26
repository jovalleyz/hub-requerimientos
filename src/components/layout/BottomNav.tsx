import { NavLink } from "react-router-dom"
const items = [
  { to: "/dashboard",    icon: "dashboard",    label: "Dashboard" },
  { to: "/requirements", icon: "view_kanban",  label: "Pipeline" },
  { to: "/projects",     icon: "account_tree", label: "Proyectos" },
  { to: "/admin/tenants",icon: "settings",     label: "Admin" },
]
export default function BottomNav() {
  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:50, display:"flex", alignItems:"center", background:"var(--color-surface)", borderTop:"1px solid var(--color-outline-variant)", height:64 }}>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
          flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2,
          padding:8, textDecoration:"none", color: isActive ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
        })}>
          <span className="material-symbols-outlined" style={{ fontSize:24 }}>{item.icon}</span>
          <span style={{ fontSize:10, fontWeight:500 }}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
