import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"
import {
  getProjects, createProject, updateProject, deleteProject,
} from "@/services/projectsService"
import { createNotification } from "@/services/notificationsService"
import type { Project } from "@/types"

export function useProjects() {
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useQuery({
    queryKey:  ["projects", tenantId],
    queryFn:   () => getProjects(tenantId),
    enabled:   !!tenantId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  const { activeTenant, user } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: (data: Omit<Project, "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy">) =>
      createProject(tenantId, data, user?.uid ?? ""),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", tenantId] }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  const { activeTenant, user } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Project, "id" | "tenantId" | "createdAt" | "createdBy">> }) => {
      // Detect newly assigned phase members and notify them
      if (user && data.phases) {
        const cached = qc.getQueryData<Project[]>(["projects", tenantId])
        const prev = cached?.find(p => p.id === id)
        if (prev) {
          for (const phase of data.phases) {
            const prevPhase = prev.phases.find(ph => ph.id === phase.id)
            const prevAssigned = prevPhase?.assignedTo ?? []
            const added = (phase.assignedTo ?? []).filter(uid => !prevAssigned.includes(uid))
            for (const uid of added) {
              await createNotification(uid, "phase_assignment",
                "Fuiste asignado a una fase de proyecto",
                `${user.displayName} te asignó a la fase "${phase.name}" en el proyecto "${prev.name}"`)
            }
          }
        }
      }
      await updateProject(tenantId, id, data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", tenantId] }),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: (id: string) => deleteProject(tenantId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", tenantId] }),
  })
}
