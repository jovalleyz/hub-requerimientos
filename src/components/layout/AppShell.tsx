import { Outlet } from "react-router-dom"
import Sidebar  from "./Sidebar"
import TopNav   from "./TopNav"
import BottomNav from "./BottomNav"
import NotificationDrawer from "@/components/notifications/NotificationDrawer"
import { useNotifications } from "@/hooks/useNotifications"

// Mount the notification hook at app-shell level so the real-time listener
// runs while any authenticated route is active.
function NotificationsBridge() {
  useNotifications()
  return <NotificationDrawer />
}

export default function AppShell() {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--color-background)" }}>
      <Sidebar />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>
        <TopNav />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", paddingBottom: "80px" }}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <NotificationsBridge />
    </div>
  )
}
