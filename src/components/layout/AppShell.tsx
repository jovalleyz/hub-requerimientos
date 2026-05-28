import { Outlet } from "react-router-dom"
import Sidebar  from "./Sidebar"
import TopNav   from "./TopNav"
import BottomNav from "./BottomNav"
import NotificationDrawer from "@/components/notifications/NotificationDrawer"
import EmailVerificationBanner from "./EmailVerificationBanner"
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
        <EmailVerificationBanner />
        <TopNav />
        <main className="p-6 pb-24 lg:pb-6" style={{ flex: 1, overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <NotificationsBridge />
    </div>
  )
}
