import {
  doc, collection, query, orderBy,
  getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  serverTimestamp, type Timestamp,
} from "firebase/firestore"
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from "firebase/storage"
import { db, storage } from "./firebase"
import type { Requirement, RequirementTask, RequirementNote, ActivityEntry } from "../types/index"

// ─── Requirement ──────────────────────────────────────────────────────────────

export async function getRequirement(tenantId: string, reqId: string): Promise<Requirement | null> {
  const snap = await getDoc(doc(db, "tenants", tenantId, "requirements", reqId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Requirement
}

export async function updateRequirement(
  tenantId: string,
  reqId: string,
  data: Partial<Omit<Requirement, "id" | "tenantId" | "createdAt" | "createdBy">>
): Promise<void> {
  await updateDoc(doc(db, "tenants", tenantId, "requirements", reqId), {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasks(tenantId: string, reqId: string): Promise<RequirementTask[]> {
  const q = query(
    collection(db, "tenants", tenantId, "requirements", reqId, "tasks"),
    orderBy("createdAt", "asc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as RequirementTask))
}

export async function addTask(
  tenantId: string,
  reqId: string,
  title: string,
  assignedTo?: string
): Promise<void> {
  const now = new Date().toISOString()
  await addDoc(collection(db, "tenants", tenantId, "requirements", reqId, "tasks"), {
    requirementId: reqId,
    tenantId,
    title,
    completed: false,
    assignedTo: assignedTo ?? null,
    createdAt: now,
    updatedAt: now,
  })
  // Increment taskCount on parent
  const reqRef = doc(db, "tenants", tenantId, "requirements", reqId)
  const reqSnap = await getDoc(reqRef)
  if (reqSnap.exists()) {
    const d = reqSnap.data()
    await updateDoc(reqRef, { taskCount: (d.taskCount ?? 0) + 1, updatedAt: now })
  }
}

export async function toggleTask(
  tenantId: string,
  reqId: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  const now = new Date().toISOString()
  await updateDoc(
    doc(db, "tenants", tenantId, "requirements", reqId, "tasks", taskId),
    { completed, updatedAt: now }
  )
  // Update completedTaskCount on parent
  const tasks = await getTasks(tenantId, reqId)
  const completedCount = tasks.filter(t => (t.id === taskId ? completed : t.completed)).length
  await updateDoc(doc(db, "tenants", tenantId, "requirements", reqId), {
    completedTaskCount: completedCount,
    updatedAt: now,
  })
}

export async function deleteTask(tenantId: string, reqId: string, taskId: string): Promise<void> {
  await deleteDoc(doc(db, "tenants", tenantId, "requirements", reqId, "tasks", taskId))
  const reqRef = doc(db, "tenants", tenantId, "requirements", reqId)
  const reqSnap = await getDoc(reqRef)
  if (reqSnap.exists()) {
    const d = reqSnap.data()
    const now = new Date().toISOString()
    await updateDoc(reqRef, {
      taskCount: Math.max(0, (d.taskCount ?? 1) - 1),
      updatedAt: now,
    })
  }
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function getNotes(tenantId: string, reqId: string): Promise<RequirementNote[]> {
  const q = query(
    collection(db, "tenants", tenantId, "requirements", reqId, "notes"),
    orderBy("createdAt", "asc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as RequirementNote))
}

export async function addNote(
  tenantId: string,
  reqId: string,
  content: string,
  authorId: string,
  authorName: string
): Promise<void> {
  const now = new Date().toISOString()
  await addDoc(collection(db, "tenants", tenantId, "requirements", reqId, "notes"), {
    requirementId: reqId,
    tenantId,
    content,
    authorId,
    authorName,
    createdAt: now,
    updatedAt: now,
  })
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export async function getActivity(tenantId: string, reqId: string): Promise<ActivityEntry[]> {
  const q = query(
    collection(db, "tenants", tenantId, "requirements", reqId, "activity"),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityEntry))
}

export async function addActivityEntry(
  tenantId: string,
  reqId: string,
  entry: Omit<ActivityEntry, "id" | "tenantId" | "requirementId" | "createdAt">
): Promise<void> {
  await addDoc(collection(db, "tenants", tenantId, "requirements", reqId, "activity"), {
    ...entry,
    requirementId: reqId,
    tenantId,
    createdAt: new Date().toISOString(),
  })
}

// ─── Documents ────────────────────────────────────────────────────────────────

export interface ReqDocument {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: string
  storagePath: string
}

export async function getDocuments(tenantId: string, reqId: string): Promise<ReqDocument[]> {
  const q = query(
    collection(db, "tenants", tenantId, "requirements", reqId, "documents"),
    orderBy("uploadedAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReqDocument))
}

export async function uploadDocument(
  tenantId: string,
  reqId: string,
  file: File,
  uploadedBy: string,
  onProgress?: (pct: number) => void
): Promise<ReqDocument> {
  const storagePath = `tenants/${tenantId}/requirements/${reqId}/${Date.now()}_${file.name}`
  const storageRef = ref(storage, storagePath)
  const task = uploadBytesResumable(storageRef, file)

  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      resolve
    )
  })

  const url = await getDownloadURL(task.snapshot.ref)
  const now = new Date().toISOString()
  const docData: Omit<ReqDocument, "id"> = {
    name: file.name,
    url,
    size: file.size,
    type: file.type,
    uploadedBy,
    uploadedAt: now,
    storagePath,
  }
  const docRef = await addDoc(
    collection(db, "tenants", tenantId, "requirements", reqId, "documents"),
    docData
  )
  return { id: docRef.id, ...docData }
}

export async function deleteDocument(
  tenantId: string,
  reqId: string,
  docId: string,
  storagePath: string
): Promise<void> {
  await deleteDoc(doc(db, "tenants", tenantId, "requirements", reqId, "documents", docId))
  try { await deleteObject(ref(storage, storagePath)) } catch { /* already deleted */ }
}

// suppress unused import warning — serverTimestamp available for callers
void (serverTimestamp as unknown)
void ((_: Timestamp) => _)
