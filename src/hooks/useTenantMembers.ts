import { useQuery } from "@tanstack/react-query"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/services/firebase"
import { useAuthStore } from "@/store/authStore"
import type { User } from "@/types"

async function getTenantMembers(tenantId: string): Promise<User[]> {
  if (!tenantId) return []
  const q = query(
    collection(db, "users"),
    where("tenantIds", "array-contains", tenantId)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as User))
}

export function useTenantMembers() {
  const { activeTenant } = useAuthStore()
  const tenantId = activeTenant?.id ?? ""
  return useQuery({
    queryKey: ["tenantMembers", tenantId],
    queryFn:  () => getTenantMembers(tenantId),
    enabled:  !!tenantId,
    staleTime: 1000 * 60 * 10,
  })
}
