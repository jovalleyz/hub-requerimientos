import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"
import {
  getProjectDocuments, uploadProjectDocument, deleteProjectDocument,
} from "@/services/projectDocumentService"

export function useProjectDocuments(projectId: string) {
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useQuery({
    queryKey: ["projectDocs", tenantId, projectId],
    queryFn:  () => getProjectDocuments(tenantId, projectId),
    enabled:  !!tenantId && !!projectId,
  })
}

export function useUploadProjectDocument(projectId: string) {
  const qc = useQueryClient()
  const { activeTenant, user } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      uploadProjectDocument(tenantId, projectId, file, user?.uid ?? "", onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projectDocs", tenantId, projectId] }),
  })
}

export function useDeleteProjectDocument(projectId: string) {
  const qc = useQueryClient()
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: ({ docId, storagePath }: { docId: string; storagePath: string }) =>
      deleteProjectDocument(tenantId, projectId, docId, storagePath),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projectDocs", tenantId, projectId] }),
  })
}
