import {
  collection, query, where, orderBy, limit,
  getDocs, onSnapshot, type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Requirement, RequirementStatus } from "../types/index"

export async function getRequirementsByTenant(tenantId: string): Promise<Requirement[]> {
  if (!tenantId) return []
  const q = query(
    collection(db, "tenants", tenantId, "requirements"),
    orderBy("updatedAt", "desc"),
    limit(100)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Requirement))
}

export function subscribeToRequirements(
  tenantId: string,
  callback: (reqs: Requirement[]) => void
): Unsubscribe {
  if (!tenantId) return () => {}
  const q = query(
    collection(db, "tenants", tenantId, "requirements"),
    orderBy("updatedAt", "desc")
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Requirement)))
  })
}

export async function getUrgentRequirements(tenantId: string): Promise<Requirement[]> {
  if (!tenantId) return []
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

  const q = query(
    collection(db, "tenants", tenantId, "requirements"),
    where("status", "!=", "COMPLETED"),
    where("deadline", "<=", threeDaysFromNow.toISOString()),
    orderBy("deadline", "asc"),
    limit(10)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Requirement))
}

export function buildDashboardMetrics(requirements: Requirement[]) {
  const byStatus: Record<RequirementStatus, number> = {
    BACKLOG: 0, ANALYSIS: 0, IN_PROGRESS: 0, REVIEW: 0, COMPLETED: 0, CANCELLED: 0,
  }
  requirements.forEach(r => {
    const s = r.status as RequirementStatus
    byStatus[s] = (byStatus[s] ?? 0) + 1
  })

  const now    = new Date()
  const ago7d  = new Date(now); ago7d.setDate(now.getDate() - 7)
  const ago30d = new Date(now); ago30d.setDate(now.getDate() - 30)

  const completed  = requirements.filter(r => r.status === "COMPLETED")
  const last7d     = completed.filter(r => new Date(r.updatedAt) >= ago7d).length
  const last30d    = completed.filter(r => new Date(r.updatedAt) >= ago30d).length

  const total      = requirements.length
  const inProgress = byStatus.IN_PROGRESS + byStatus.ANALYSIS + byStatus.REVIEW

  const urgent = requirements.filter(r => {
    if (!r.deadline || r.status === "COMPLETED" || r.status === "CANCELLED") return false
    const diff = (new Date(r.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 3 && diff >= 0
  })

  const conversionRate = total > 0
    ? Math.round((byStatus.COMPLETED / total) * 100)
    : 0

  return { total, byStatus, inProgress, last7d, last30d, urgent, conversionRate }
}
