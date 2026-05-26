import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"
import {
  getProjects, createProject, updateProject, deleteProject,
} from "@/services/projectsService"
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
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Project, "id" | "tenantId" | "createdAt" | "createdBy">> }) =>
      updateProject(tenantId, id, data),
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
