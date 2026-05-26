import { useState } from "react"
import type { User, UserRole } from "@/types"
import { useTenantUsers, useUpdateUserRole } from "@/hooks/useAdmin"
import { useAuthStore } from "@/store/authStore"

const ROLES: { value: UserRole; label: string; color: string; desc: string }[] = [
  { value: "ADMIN",   label: "Admin",   color: "#ba1a1a", desc: "Control total" },
  { value: "MANAGER", label: "Manager", color: "#D97706", desc: "Gestión de reqs" },
  { value: "DEV",     label: "Dev",     color: "#0058be", desc: "Crear y editar" },
  { value: "VIEWER",  label: "Viewer",  color: "#44546f", desc: "Solo lectura" },
]

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
  const hue = name.charCodeAt(0) * 37 % 360
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${hue},50%,44%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function RoleDropdown({ user, onSave, disabled }: { user: User; onSave: (role: UserRole) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const current = ROLES.find(r => r.value === user.role) ?? ROLES[3]

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(v => !v)}
        disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm font-semibold border transition-all hover:opacity-80 disabled:opacity-50"
        style={{ borderColor: current.color, color: current.color, background: `color-mix(in srgb, ${current.color} 12%, transparent)` }}
      >
        {current.label}
        <span className="material-symbols-outlined text-[13px]">expand_more</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 tonal-card min-w-[180px] py-1 shadow-xl rounded-2xl overflow-hidden">
            {ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => { onSave(r.value); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm hover:bg-[var(--color-surface-container)] transition-colors"
              >
                <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                <div className="text-left">
                  <p className="font-medium text-[var(--color-on-surface)]">{r.label}</p>
                  <p className="text-[var(--color-on-surface-variant)] text-[11px]">{r.desc}</p>
                </div>
                {r.value === user.role && (
                  <span className="material-symbols-outlined text-[14px] ml-auto" style={{ color: r.color }}>check</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function UserTable() {
  const { data: users = [], isLoading } = useTenantUsers()
  const changeRole = useUpdateUserRole()
  const { user: me } = useAuthStore()
  const [search, setSearch] = useState("")

  const filtered = users.filter(u =>
    !search || u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Search */}
      <div className="flex items-center justify-between mb-5">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">search</span>
          <input
            type="text"
            placeholder="Buscar usuario…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-body-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors w-60"
          />
        </div>
        <p className="text-label-sm text-[var(--color-on-surface-variant)]">
          {users.length} usuario{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-2xl bg-[var(--color-surface-container)] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-[var(--color-on-surface-variant)]">
          <span className="material-symbols-outlined text-[40px] opacity-30 block mb-2">group</span>
          <p className="text-body-md">{users.length === 0 ? "Sin usuarios en este tenant" : "Sin resultados"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.uid} className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)] transition-colors">
              <Avatar name={u.displayName} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-body-md font-medium text-[var(--color-on-surface)] truncate">{u.displayName}</p>
                  {u.uid === me?.uid && (
                    <span className="text-label-sm px-2 py-0.5 rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                      Tú
                    </span>
                  )}
                </div>
                <p className="text-label-sm text-[var(--color-on-surface-variant)] truncate">{u.email}</p>
              </div>
              <RoleDropdown
                user={u}
                disabled={u.uid === me?.uid}
                onSave={role => changeRole.mutate({ uid: u.uid, role })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
