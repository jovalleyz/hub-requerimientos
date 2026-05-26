import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../store/authStore"
import { getRequirementsByTenant } from "../services/requirementsService"
import {
  doc, updateDoc, addDoc, collection
} from "firebase/firestore"
import { db } from "../services/firebase"
import type { Requirement, RequirementStatus } from "../types/index"

export function useRequirements() {
  const activeTenant = useAuthStore(s => s.activeTenant)
  const tenantId     = activeTenant?.id ?? ""

  return useQuery({
    queryKey: ["requirements", tenantId],
    queryFn:  () => getRequirementsByTenant(tenantId),
    enabled:  !!tenantId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUpdateRequirementStatus() {
  const qc           = useQueryClient()
  const activeTenant = useAuthStore(s => s.activeTenant)
  const tenantId     = activeTenant?.id ?? ""

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RequirementStatus }) => {
      const ref = doc(db, "tenants", tenantId, "requirements", id)
      await updateDoc(ref, { status, updatedAt: new Date().toISOString() })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requirements", tenantId] })
      qc.invalidateQueries({ queryKey: ["dashboard",     tenantId] })
    },
  })
}

export function useCreateRequirement() {
  const qc           = useQueryClient()
  const activeTenant = useAuthStore(s => s.activeTenant)
  const user         = useAuthStore(s => s.user)
  const tenantId     = activeTenant?.id ?? ""

  return useMutation({
    mutationFn: async (data: Omit<Requirement, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">) => {
      const ref = collection(db, "tenants", tenantId, "requirements")
      await addDoc(ref, {
        ...data,
        tenantId,
        createdBy: user?.uid ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status:    "INITIATED",
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requirements", tenantId] })
      qc.invalidateQueries({ queryKey: ["dashboard",     tenantId] })
    },
  })
}

