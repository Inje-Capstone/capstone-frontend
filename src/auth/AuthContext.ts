import { createContext, useContext } from 'react'
import type { LoginRequest, OnboardingStatus } from '../types/backend'

export type AuthState =
  | { status: 'checking' }
  | { status: 'anonymous'; expired: boolean; redirectTo?: '/splash' }
  | { status: 'authenticated'; onboarding: OnboardingStatus; token: string }
  | { status: 'error'; message: string }
export interface AuthContextValue {
  state: AuthState
  demo: boolean
  startDemo: (options?: { reset?: boolean; nickname?: string; email?: string }) => void
  signIn: (credentials: LoginRequest) => Promise<void>
  completeOAuth: (code:string) => Promise<void>
  signOutToSplash: () => void
  signOut: () => void
  refreshSession: () => Promise<void>
}
export const AuthContext = createContext<AuthContextValue | null>(null)
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('AuthProvider가 필요합니다.')
  return context
}

