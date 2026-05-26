import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../store/authStore"
import { getRequirementsByTenant, buildDashboardMetrics } from "../services/requirementsService"

export function useDashboard() {
  const activeTenant = useAuthStore(s => s.activeTenant)
  const tenantId     = activeTenant?.id ?? ""

  return useQuery({
    queryKey: ["dashboard", tenantId],
    queryFn:  async () => {
      const reqs    = await getRequirementsByTenant(tenantId)
      const metrics = buildDashboardMetrics(reqs)
      return { reqs, metrics }
    },
    enabled:       !!tenantId,
    staleTime:     1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  })
}
