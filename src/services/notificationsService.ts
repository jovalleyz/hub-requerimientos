import {
  collection, query, where, orderBy, limit,
  getDocs, addDoc, updateDoc, doc, writeBatch,
  onSnapshot, type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Notification } from "../types/index"

const col = (userId: string) => collection(db, "users", userId, "notifications")

export async function getNotifications(userId: string, count = 30): Promise<Notification[]> {
  if (!userId) return []
  const q = query(col(userId), orderBy("createdAt", "desc"), limit(count))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification))
}

export function subscribeNotifications(
  userId: string,
  callback: (items: Notification[]) => void
): Unsubscribe {
  if (!userId) return () => {}
  const q = query(col(userId), orderBy("createdAt", "desc"), limit(30))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)))
  })
}

export async function markAsRead(userId: string, notifId: string): Promise<void> {
  await updateDoc(doc(db, "users", userId, "notifications", notifId), { isRead: true })
}

export async function markAllAsRead(userId: string): Promise<void> {
  const q = query(col(userId), where("isRead", "==", false))
  const snap = await getDocs(q)
  if (snap.empty) return
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.update(d.ref, { isRead: true }))
  await batch.commit()
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string
): Promise<void> {
  await addDoc(col(userId), {
    userId, type, title, message,
    isRead: false,
    createdAt: new Date().toISOString(),
  })
}
