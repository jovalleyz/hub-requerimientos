import {
  collection, query, orderBy, limit,
  getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Project, ProjectPhase } from "../types/index"

const col = (tenantId: string) => collection(db, "tenants", tenantId, "projects")

function newId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function getProjects(tenantId: string): Promise<Project[]> {
  if (!tenantId) return []
  const q = query(col(tenantId), orderBy("createdAt", "desc"), limit(100))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project))
}

export async function getProject(tenantId: string, projectId: string): Promise<Project | null> {
  const snap = await getDoc(doc(db, "tenants", tenantId, "projects", projectId))
  return snap.exists() ? { id: snap.id, ...snap.data() } as Project : null
}

export async function createProject(
  tenantId: string,
  data: Omit<Project, "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy">,
  createdBy: string
): Promise<string> {
  const now = new Date().toISOString()
  const ref = await addDoc(col(tenantId), {
    ...data,
    tenantId,
    createdBy,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function updateProject(
  tenantId: string,
  projectId: string,
  data: Partial<Omit<Project, "id" | "tenantId" | "createdAt" | "createdBy">>
): Promise<void> {
  await updateDoc(doc(db, "tenants", tenantId, "projects", projectId), {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteProject(tenantId: string, projectId: string): Promise<void> {
  await deleteDoc(doc(db, "tenants", tenantId, "projects", projectId))
}

export function buildEmptyPhase(): ProjectPhase {
  const today = new Date()
  const end   = new Date(today); end.setDate(end.getDate() + 30)
  return {
    id:        newId(),
    name:      "Nueva fase",
    startDate: today.toISOString().slice(0, 10),
    endDate:   end.toISOString().slice(0, 10),
    status:    "pending",
    progress:  0,
  }
}
