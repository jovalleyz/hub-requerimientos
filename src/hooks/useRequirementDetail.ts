import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"
import {
  getRequirement, updateRequirement,
  getTasks, addTask, toggleTask, deleteTask,
  getNotes, addNote,
  getActivity, addActivityEntry,
  getDocuments, uploadDocument, deleteDocument,
} from "@/services/requirementDetailService"
import { createNotification } from "@/services/notificationsService"
import type { Requirement } from "@/types"

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog", ANALYSIS: "Análisis", IN_PROGRESS: "En progreso",
  REVIEW: "Revisión", COMPLETED: "Completado", CANCELLED: "Cancelado",
}

// ─── Requirement ──────────────────────────────────────────────────────────────

export function useRequirement(reqId: string) {
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useQuery({
    queryKey: ["requirement", tenantId, reqId],
    queryFn:  () => getRequirement(tenantId, reqId),
    enabled:  !!tenantId && !!reqId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUpdateRequirement(reqId: string) {
  const qc = useQueryClient()
  const { activeTenant, user } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: async (data: Partial<Omit<Requirement, "id" | "tenantId" | "createdAt" | "createdBy">>) => {
      const cached = qc.getQueryData<Requirement>(["requirement", tenantId, reqId])
      await updateRequirement(tenantId, reqId, data)

      if (!user) return
      // Log status change
      if (data.status && cached && data.status !== cached.status) {
        await addActivityEntry(tenantId, reqId, {
          action: `Estado: ${STATUS_LABELS[cached.status] ?? cached.status} → ${STATUS_LABELS[data.status] ?? data.status}`,
          actorId: user.uid,
          actorName: user.displayName,
          metadata: { from: cached.status, to: data.status },
        })
      }
      // Log + notify newly added collaborators
      if (data.assignedTo && cached?.assignedTo) {
        const added = data.assignedTo.filter(id => !cached.assignedTo.includes(id))
        if (added.length > 0) {
          await addActivityEntry(tenantId, reqId, {
            action: `${added.length} colaborador(es) asignado(s)`,
            actorId: user.uid,
            actorName: user.displayName,
            metadata: { added },
          })
          for (const uid of added) {
            await createNotification(uid, "assignment",
              "Fuiste asignado a un requerimiento",
              `${user.displayName} te asignó al requerimiento: ${cached.title}`)
          }
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requirement", tenantId, reqId] })
      qc.invalidateQueries({ queryKey: ["requirements", tenantId] })
      qc.invalidateQueries({ queryKey: ["activity", tenantId, reqId] })
      qc.invalidateQueries({ queryKey: ["dashboard", tenantId] })
    },
  })
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function useTasks(reqId: string) {
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useQuery({
    queryKey: ["tasks", tenantId, reqId],
    queryFn:  () => getTasks(tenantId, reqId),
    enabled:  !!tenantId && !!reqId,
  })
}

export function useAddTask(reqId: string) {
  const qc = useQueryClient()
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: ({ title, assignedTo }: { title: string; assignedTo?: string }) =>
      addTask(tenantId, reqId, title, assignedTo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", tenantId, reqId] })
      qc.invalidateQueries({ queryKey: ["requirement", tenantId, reqId] })
    },
  })
}

export function useToggleTask(reqId: string) {
  const qc = useQueryClient()
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      toggleTask(tenantId, reqId, taskId, completed),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", tenantId, reqId] })
      qc.invalidateQueries({ queryKey: ["requirement", tenantId, reqId] })
    },
  })
}

export function useDeleteTask(reqId: string) {
  const qc = useQueryClient()
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(tenantId, reqId, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", tenantId, reqId] }),
  })
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function useNotes(reqId: string) {
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useQuery({
    queryKey: ["notes", tenantId, reqId],
    queryFn:  () => getNotes(tenantId, reqId),
    enabled:  !!tenantId && !!reqId,
  })
}

export function useAddNote(reqId: string) {
  const qc = useQueryClient()
  const { activeTenant, user } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: (content: string) =>
      addNote(tenantId, reqId, content, user?.uid ?? "", user?.displayName ?? "Usuario"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", tenantId, reqId] }),
  })
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export function useActivity(reqId: string) {
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useQuery({
    queryKey: ["activity", tenantId, reqId],
    queryFn:  () => getActivity(tenantId, reqId),
    enabled:  !!tenantId && !!reqId,
  })
}

// ─── Documents ────────────────────────────────────────────────────────────────

export function useDocuments(reqId: string) {
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useQuery({
    queryKey: ["documents", tenantId, reqId],
    queryFn:  () => getDocuments(tenantId, reqId),
    enabled:  !!tenantId && !!reqId,
  })
}

export function useUploadDocument(reqId: string) {
  const qc = useQueryClient()
  const { activeTenant, user } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      uploadDocument(tenantId, reqId, file, user?.uid ?? "", onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents", tenantId, reqId] }),
  })
}

export function useDeleteDocument(reqId: string) {
  const qc = useQueryClient()
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useMutation({
    mutationFn: ({ docId, storagePath }: { docId: string; storagePath: string }) =>
      deleteDocument(tenantId, reqId, docId, storagePath),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents", tenantId, reqId] }),
  })
}
