import { useEffect } from 'react'
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup, updateProfile,
  type UserCredential,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { useAuthStore } from '../store/authStore'
import type { User } from '../types/index'

const googleProvider = new GoogleAuthProvider()

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const snap = await getDoc(doc(db, 'users', fbUser.uid))
        if (snap.exists()) {
          setUser(snap.data() as User)
        } else {
          const newUser: User = {
            uid: fbUser.uid, email: fbUser.email ?? '', displayName: fbUser.displayName ?? '',
            photoURL: fbUser.photoURL ?? undefined, role: 'VIEWER',
            tenantIds: [], activeTenantId: '',
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          }
          await setDoc(doc(db, 'users', fbUser.uid), newUser)
          setUser(newUser)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [setUser, setLoading])

  async function login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password)
  }
  async function register(email: string, password: string, displayName: string): Promise<UserCredential> {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    return cred
  }
  async function loginWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, googleProvider)
  }
  async function logoutUser(): Promise<void> {
    await signOut(auth)
    logout()
  }

  return { user, isAuthenticated, isLoading, login, register, loginWithGoogle, logout: logoutUser }
}
