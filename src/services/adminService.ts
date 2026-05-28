import {
  collection, query, where, orderBy, limit,
  getDocs, getDoc, updateDoc, addDoc, doc,
} from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db, storage } from "./firebase"
import type { Tenant, User, UserRole, TenantBranding } from "../types/index"

// ─── Tenant ───────────────────────────────────────────────────────────────────

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const snap = await getDoc(doc(db, "tenants", tenantId))
  return snap.exists() ? { id: snap.id, ...snap.data() } as Tenant : null
}

export async function updateTenant(
  tenantId: string,
  data: Partial<Omit<Tenant, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "tenants", tenantId), {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function createTenant(
  data: Omit<Tenant, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const now = new Date().toISOString()
  const ref2 = await addDoc(collection(db, "tenants"), {
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  return ref2.id
}

// ─── Branding + Logo ──────────────────────────────────────────────────────────

export async function uploadTenantLogo(
  tenantId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const storagePath = `tenants/${tenantId}/logo/${Date.now()}_${file.name}`
  const storageRef  = ref(storage, storagePath)
  const task        = uploadBytesResumable(storageRef, file)

  await new Promise<void>((resolve, reject) => {
    task.on("state_changed",
      snap => onProgress?.(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
      reject,
      resolve
    )
  })

  const url = await getDownloadURL(task.snapshot.ref)
  await updateDoc(doc(db, "tenants", tenantId), {
    "branding.logoUrl": url,
    updatedAt: new Date().toISOString(),
  })
  return url
}

export async function saveBranding(
  tenantId: string,
  branding: Partial<TenantBranding>
): Promise<void> {
  const updates: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(branding)) {
    updates[`branding.${k}`] = v
  }
  await updateDoc(doc(db, "tenants", tenantId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  })
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getTenantUsers(tenantId: string): Promise<User[]> {
  const q = query(
    collection(db, "users"),
    where("tenantIds", "array-contains", tenantId),
    limit(200)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ ...d.data(), uid: d.id } as User))
}

export async function updateUserRole(
  uid: string,
  role: UserRole
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    role,
    updatedAt: new Date().toISOString(),
  })
}

// ─── Audit log ────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id:        string
  action:    string
  actorId:   string
  actorName: string
  target?:   string
  detail?:   string
  createdAt: string
}

export async function getAuditLog(tenantId: string, count = 50): Promise<AuditEntry[]> {
  const q = query(
    collection(db, "tenants", tenantId, "audit"),
    orderBy("createdAt", "desc"),
    limit(count)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditEntry))
}

export async function addAuditEntry(
  tenantId: string,
  entry: Omit<AuditEntry, "id" | "createdAt">
): Promise<void> {
  await addDoc(collection(db, "tenants", tenantId, "audit"), {
    ...entry,
    createdAt: new Date().toISOString(),
  })
}

// ─── Invitations ──────────────────────────────────────────────────────────────

import type { Invitation } from "../types/index"

export async function createInvitation(
  tenantId: string,
  email: string,
  role: UserRole,
  createdBy: string
): Promise<string> {
  const now      = new Date()
  const expires  = new Date(now); expires.setDate(expires.getDate() + 7)
  const ref2 = await addDoc(collection(db, "_invitations"), {
    email: email.toLowerCase().trim(),
    role, tenantId, createdBy,
    status:    "pending",
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  })
  return ref2.id
}

export async function getPendingInvitations(tenantId: string): Promise<Invitation[]> {
  const snap = await getDocs(query(
    collection(db, "_invitations"),
    where("tenantId", "==", tenantId),
    where("status",   "==", "pending"),
  ))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Invitation))
}

export async function cancelInvitation(inviteId: string): Promise<void> {
  await updateDoc(doc(db, "_invitations", inviteId), { status: "expired" })
}
