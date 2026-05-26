import { useState } from "react"
import { useAuthStore } from "../store/authStore"
import { useDashboard }  from "../hooks/useDashboard"
import MetricCard   from "../components/dashboard/MetricCard"
import FunnelChart  from "../components/dashboard/FunnelChart"
import ActivityFeed from "../components/dashboard/ActivityFeed"

function SkeletonCard() {
  return (
    <div className="tonal-card" style={{ padding: 20 }}>
      <div style={{ height: 14, width: "60%", background: "var(--color-surface-container)", borderRadius: 6, marginBottom: 12, animation: "pulse 1.5s ease infinite" }} />
      <div style={{ height: 36, width: "40%", background: "var(--color-surface-container)", borderRadius: 6 }} />
    </div>
  )
}

const STAGE_SUMMARY = [
  { label: "Backlog",     key: "BACKLOG",      color: "#44546f" },
  { label: "Análisis",   key: "ANALYSIS",     color: "#7C3AED" },
  { label: "En Proceso", key: "IN_PROGRESS",  color: "#0058be" },
  { label: "Revisión",   key: "REVIEW",       color: "#D97706" },
  { label: "Completado", key: "COMPLETED",    color: "#1a7f1a" },
] as const

export default function DashboardPage() {
  const { user, activeTenant } = useAuthStore()
  const { data, isLoading, isError } = useDashboard()
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")

  const metrics = data?.metrics
  const hour    = new Date().getHours()
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches"

  if (!activeTenant) {
    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--color-surface-container-high)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-secondary)" }}>domain</span>
        </div>
        <div>
          <h2 className="text-headline-sm">Selecciona un tenant</h2>
          <p className="text-body-md" style={{ color: "var(--color-on-surface-variant)", marginTop: 8 }}>
            Usa el selector de tenant en la barra superior para comenzar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="text-headline-md">{greeting}, {user?.displayName?.split(" ")[0] ?? "usuario"} 👋</h1>
        <p className="text-body-md" style={{ color: "var(--color-on-surface-variant)", marginTop: 4 }}>
          Salud del portafolio · <strong>{activeTenant.name}</strong>
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 24 }}>
        <style>{`@media(min-width:1024px){#metrics-grid{grid-template-columns:repeat(4,1fr)!important}}`}</style>
        <div id="metrics-grid" style={{ display: "contents" }}>
          {isLoading ? (
            [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
          ) : (
            <>
              <MetricCard
                label="Total Requerimientos"
                value={metrics?.total ?? 0}
                icon="inventory_2"
                trend={{ value: metrics?.last30d ?? 0, label: "completados este mes" }}
              />
              <MetricCard
                label="En Proceso"
                value={metrics?.inProgress ?? 0}
                icon="pending_actions"
                accent="default"
              />
              <MetricCard
                label="Completados (7d)"
                value={metrics?.last7d ?? 0}
                icon="task_alt"
                accent="success"
                trend={{ value: metrics?.conversionRate ?? 0, label: "% conversión" }}
              />
              <MetricCard
                label="Alertas Urgentes"
                value={metrics?.urgent.length ?? 0}
                icon="warning"
                accent={metrics?.urgent.length ? "error" : "default"}
              />
            </>
          )}
        </div>
      </div>

      {/* Bento Grid */}
      <div id="bento-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
        <style>{`@media(min-width:1024px){#bento-grid{grid-template-columns:2fr 1fr!important}}`}</style>

        {/* Funnel Chart */}
        <div className="tonal-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 className="text-headline-sm">Pipeline de requerimientos</h2>
              <p className="text-body-sm" style={{ color: "var(--color-on-surface-variant)", marginTop: 2 }}>
                Distribución por etapa · {metrics?.total ?? 0} total
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["7d", "30d", "90d"] as const).map(f => (
                <button key={f} onClick={() => setPeriod(f)} style={{
                  padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer",
                  background: period === f ? "var(--color-secondary)" : "var(--color-surface-container)",
                  color: period === f ? "white" : "var(--color-on-surface-variant)",
                }}>{f}</button>
              ))}
            </div>
          </div>
          {isLoading
            ? <div style={{ height: 200, background: "var(--color-surface-container)", borderRadius: 12, animation: "pulse 1.5s ease infinite" }} />
            : <FunnelChart byStatus={metrics?.byStatus ?? {}} total={metrics?.total ?? 0} />
          }

          {/* Stage summary row */}
          {!isLoading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginTop: 20 }}>
              {STAGE_SUMMARY.map(s => (
                <div key={s.key} style={{ textAlign: "center", padding: "10px 4px", borderRadius: 10, background: "var(--color-surface-container-low)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, margin: "0 auto 6px" }} />
                  <p style={{ fontSize: 18, fontWeight: 700, color: "var(--color-on-surface)" }}>
                    {metrics?.byStatus[s.key] ?? 0}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--color-on-surface-variant)", fontWeight: 500 }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgentes */}
        <div className="tonal-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 className="text-headline-sm">Alertas urgentes</h2>
              <p className="text-body-sm" style={{ color: "var(--color-on-surface-variant)", marginTop: 2 }}>
                Vencen en 3 días o menos
              </p>
            </div>
            {(metrics?.urgent.length ?? 0) > 0 && (
              <span style={{ minWidth: 24, height: 24, padding: "0 8px", background: "var(--color-error)", color: "white", borderRadius: 9999, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {metrics?.urgent.length}
              </span>
            )}
          </div>
          {isLoading
            ? <div style={{ height: 200, background: "var(--color-surface-container)", borderRadius: 12, animation: "pulse 1.5s ease infinite" }} />
            : <ActivityFeed urgent={metrics?.urgent ?? []} />
          }
        </div>
      </div>

      {/* KPIs secundarios */}
      <div id="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <style>{`@media(max-width:640px){#kpi-grid{grid-template-columns:1fr!important}}`}</style>
        {[
          { label: "Tasa de conversión",  value: `${metrics?.conversionRate ?? 0}%`, icon: "conversion_path", desc: "Requerimientos → Completado" },
          { label: "Completados 30 días", value: metrics?.last30d ?? 0,               icon: "calendar_month",  desc: "Últimos 30 días" },
          { label: "Completados 7 días",  value: metrics?.last7d ?? 0,                icon: "today",           desc: "Últimos 7 días" },
        ].map(k => (
          <div key={k.label} className="tonal-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-secondary)" }}>{k.icon}</span>
              <p className="text-label-md" style={{ color: "var(--color-on-surface-variant)" }}>{k.label}</p>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: "var(--color-on-surface)" }}>{isLoading ? "—" : k.value}</p>
            <p className="text-body-sm" style={{ color: "var(--color-on-surface-variant)", marginTop: 4 }}>{k.desc}</p>
          </div>
        ))}
      </div>

      {isError && (
        <div style={{ marginTop: 16, padding: 16, background: "var(--color-error-container)", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: "var(--color-error)", fontSize: 20 }}>error</span>
          <p className="text-body-md" style={{ color: "var(--color-error)" }}>Error cargando datos. Verifica tu conexión.</p>
        </div>
      )}
    </div>
  )
}
