import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { useAdminTenant } from "@/hooks/useAdmin"
import TenantInfoForm          from "@/components/admin/TenantInfoForm"
import BrandingEditor          from "@/components/admin/BrandingEditor"
import UserTable               from "@/components/admin/UserTable"
import AuditLogPanel           from "@/components/admin/AuditLogPanel"
import CreateFirstTenantForm   from "@/components/admin/CreateFirstTenantForm"

type Tab = "tenant" | "branding" | "users" | "audit"

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "tenant",   label: "Mi Tenant",  icon: "domain"            },
  { id: "branding", label: "Branding",   icon: "palette"           },
  { id: "users",    label: "Usuarios",   icon: "group"             },
  { id: "audit",    label: "Auditoría",  icon: "manage_history"    },
]

export default function AdminTenantsPage() {
  const { activeTenant, user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>("tenant")
  const { data: tenant, isLoading } = useAdminTenant()

  // Bootstrap: user has no tenant yet — let them create their first org
  if (!activeTenant) {
    return <CreateFirstTenantForm />
  }

  if (user?.role === "VIEWER" || user?.role === "DEV") {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-64 gap-3 text-[var(--color-on-surface-variant)]">
        <span className="material-symbols-outlined text-[48px] text-[var(--color-error)] opacity-70">lock</span>
        <p className="text-body-md font-semibold text-[var(--color-on-surface)]">Acceso restringido</p>
        <p className="text-body-sm">Requiere rol Admin o Manager</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: activeTenant.branding.primaryColor || "var(--color-primary)" }}
        >
          {activeTenant.branding.logoUrl ? (
            <img src={activeTenant.branding.logoUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <span className="material-symbols-outlined text-white text-[24px]">shield_with_heart</span>
          )}
        </div>
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">{activeTenant.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-label-sm px-2 py-0.5 rounded-full font-semibold capitalize"
              style={{
                background: activeTenant.isActive ? "#dcfce7" : "#ffdad6",
                color:      activeTenant.isActive ? "#1a7f1a" : "#ba1a1a",
              }}
            >
              {activeTenant.isActive ? "Activo" : "Inactivo"}
            </span>
            <span className="text-label-sm text-[var(--color-on-surface-variant)] capitalize">
              Plan {activeTenant.plan}
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-[var(--color-outline-variant)] overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-3 text-label-md font-medium whitespace-nowrap transition-all border-b-2 -mb-px"
            style={{
              color:       activeTab === tab.id ? "var(--color-primary)"  : "var(--color-on-surface-variant)",
              borderColor: activeTab === tab.id ? "var(--color-primary)"  : "transparent",
            }}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tonal-card p-6 animate-fade-in">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-[var(--color-surface-container)] animate-pulse" />)}
          </div>
        ) : !tenant ? (
          <div className="text-center py-10 text-[var(--color-on-surface-variant)]">
            <span className="material-symbols-outlined text-[40px] opacity-30 block mb-2">error</span>
            <p>No se pudo cargar el tenant</p>
          </div>
        ) : (
          <>
            {activeTab === "tenant"   && <TenantInfoForm tenant={tenant} />}
            {activeTab === "branding" && <BrandingEditor  tenant={tenant} />}
            {activeTab === "users"    && <UserTable />}
            {activeTab === "audit"    && <AuditLogPanel />}
          </>
        )}
      </div>
    </div>
  )
}
