import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useAuth } from './hooks/useAuth'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import PipelinePage from './pages/PipelinePage'
import RequirementDetailPage from './pages/RequirementDetailPage'
import ProjectsPage from './pages/ProjectsPage'
import AdminTenantsPage from './pages/AdminTenantsPage'
import OnboardingPage from './pages/OnboardingPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f8f9ff' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:40, height:40, border:'4px solid #0058be', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
          <p style={{ color:'#44546f', fontSize:14 }}>Cargando…</p>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  useAuth()
  return (
    <Routes>
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><AppShell /></PrivateRoute>}>
        <Route index                    element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"         element={<DashboardPage />} />
        <Route path="requirements"      element={<PipelinePage />} />
        <Route path="requirements/:id"  element={<RequirementDetailPage />} />
        <Route path="projects"          element={<ProjectsPage />} />
        <Route path="admin/tenants"     element={<AdminTenantsPage />} />
        <Route path="onboarding"        element={<OnboardingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
