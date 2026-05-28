import {
  collection, query, orderBy, getDocs, addDoc, deleteDoc, doc,
} from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "./firebase"

export interface ProjectDocument {
  id: string; name: string; url: string; size: number; type: string
  uploadedBy: string; uploadedAt: string; storagePath: string
}

export async function getProjectDocuments(tenantId: string, projectId: string): Promise<ProjectDocument[]> {
  const q = query(
    collection(db, "tenants", tenantId, "projects", projectId, "documents"),
    orderBy("uploadedAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectDocument))
}

export async function uploadProjectDocument(
  tenantId: string,
  projectId: string,
  file: File,
  uploadedBy: string,
  onProgress?: (pct: number) => void
): Promise<ProjectDocument> {
  const storagePath = `tenants/${tenantId}/projects/${projectId}/${Date.now()}_${file.name}`
  const storageRef = ref(storage, storagePath)
  const task = uploadBytesResumable(storageRef, file)

  await new Promise<void>((resolve, reject) => {
    task.on("state_changed",
      snap => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject, resolve)
  })

  const url = await getDownloadURL(task.snapshot.ref)
  const now = new Date().toISOString()
  const data: Omit<ProjectDocument, "id"> = {
    name: file.name, url, size: file.size, type: file.type,
    uploadedBy, uploadedAt: now, storagePath,
  }
  const ref2 = await addDoc(
    collection(db, "tenants", tenantId, "projects", projectId, "documents"), data
  )
  return { id: ref2.id, ...data }
}

export async function deleteProjectDocument(
  tenantId: string, projectId: string, docId: string, storagePath: string
): Promise<void> {
  await deleteDoc(doc(db, "tenants", tenantId, "projects", projectId, "documents", docId))
  try { await deleteObject(ref(storage, storagePath)) } catch { /* already deleted */ }
}
