import { useEffect } from 'react'
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, GoogleAuthProvider, OAuthProvider, signInWithPopup,
  updateProfile, sendEmailVerification, sendSignInLinkToEmail,
  isSignInWithEmailLink, signInWithEmailLink,
  type UserCredential,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { useAuthStore } from '../store/authStore'
import type { User } from '../types/index'

const googleProvider = new GoogleAuthProvider()

const microsoftProvider = new OAuthProvider('microsoft.com')
microsoftProvider.setCustomParameters({
  tenant: import.meta.env.VITE_AZURE_TENANT_ID ?? 'common',
})

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
    await sendEmailVerification(cred.user)
    return cred
  }

  async function loginWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, googleProvider)
  }

  async function loginWithMicrosoft(): Promise<UserCredential> {
    return signInWithPopup(auth, microsoftProvider)
  }

  async function resendVerificationEmail(): Promise<void> {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser)
  }

  async function sendInviteLink(email: string): Promise<void> {
    const actionCodeSettings = {
      url: `${window.location.origin}/invite`,
      handleCodeInApp: true,
    }
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    window.localStorage.setItem('inviteEmail', email)
  }

  async function acceptInviteLink(email: string): Promise<UserCredential | null> {
    if (!isSignInWithEmailLink(auth, window.location.href)) return null
    const cred = await signInWithEmailLink(auth, email, window.location.href)
    // buscar invitación pendiente para este email y aplicar rol/tenant
    const q = query(collection(db, '_invitations'), where('email', '==', email), where('status', '==', 'pending'))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const inv = snap.docs[0].data()
      const userRef = doc(db, 'users', cred.user.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const existing = userSnap.data() as User
        await updateDoc(userRef, {
          role: inv.role,
          tenantIds: [...new Set([...existing.tenantIds, inv.tenantId])],
          activeTenantId: inv.tenantId,
          updatedAt: new Date().toISOString(),
        })
      }
      await updateDoc(snap.docs[0].ref, { status: 'accepted' })
    }
    return cred
  }

  async function logoutUser(): Promise<void> {
    await signOut(auth)
    logout()
  }

  return {
    user, isAuthenticated, isLoading,
    login, register, loginWithGoogle, loginWithMicrosoft,
    resendVerificationEmail, sendInviteLink, acceptInviteLink,
    logout: logoutUser,
  }
}
