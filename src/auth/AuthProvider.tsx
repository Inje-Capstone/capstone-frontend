import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { exchangeOAuthCode } from '../api/oauthApi'
import Splash from '../components/Splash'
import { login } from '../api/authApi'
import { getOnboardingStatus } from '../api/onboardingApi'
import { ApiError, getErrorMessage, SESSION_EXPIRED_EVENT } from '../api/apiClient'
import { AuthContext } from './AuthContext'
import type { AuthState } from './AuthContext'
import { clearAccessToken, getAccessToken, setAccessToken, tokenExpiresAt } from './tokenStorage'
import type { LoginRequest } from '../types/backend'
import { freshAccount, isDemoSession, readDemo, saveDemo, setDemoSession } from '../demo/demoAccount'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'checking' })
  const [demo, setDemo] = useState(isDemoSession)
  const [splashDone,setSplashDone]=useState(()=>['/splash','/oauth/callback'].includes(window.location.pathname))
  const generation = useRef(0)
  const pending = useRef<AbortController | null>(null)

  const endSession = useCallback((expired: boolean, redirectTo?: '/splash') => {
    generation.current += 1
    pending.current?.abort()
    clearAccessToken()
    setDemoSession(false)
    setDemo(false)
    setState({ status: 'anonymous', expired, redirectTo })
  }, [])
  const signOutToSplash = useCallback(() => endSession(false,'/splash'), [endSession])
  const signOut = useCallback(() => endSession(false), [endSession])

  const refreshSession = useCallback(async () => {
    const current = ++generation.current
    pending.current?.abort()
    if (isDemoSession()) {
      setState({ status: 'authenticated', onboarding: readDemo().onboarding, token: '' })
      return
    }
    const token = getAccessToken()
    if (!token) { setState({ status: 'anonymous', expired: false }); return }
    const expiresAt = tokenExpiresAt(token)
    if (expiresAt !== null && expiresAt <= Date.now()) { endSession(true); return }
    const controller = new AbortController()
    pending.current = controller
    setState({ status: 'checking' })
    try {
      const onboarding = await getOnboardingStatus(controller.signal)
      if (current === generation.current) setState({ status: 'authenticated', onboarding, token })
    } catch (error) {
      if (current !== generation.current || controller.signal.aborted) return
      if (error instanceof ApiError && error.status === 401) endSession(true)
      else setState({ status: 'error', message: getErrorMessage(error) })
    }
  }, [endSession])

  const signIn = useCallback(async (credentials: LoginRequest) => {
    const current = ++generation.current
    const result = await login(credentials)
    if (current !== generation.current) return
    setDemoSession(false)
    setDemo(false)
    setAccessToken(result.accessToken)
    // If status lookup fails, preserve authentication and offer retry.
    await refreshSession()
  }, [refreshSession])

  const completeOAuth = useCallback(async (code:string) => {
    const current=++generation.current
    const result=await exchangeOAuthCode(code)
    if(current!==generation.current)return
    setDemoSession(false);setDemo(false);setAccessToken(result.accessToken)
    await refreshSession()
  },[refreshSession])

  const startDemo = useCallback((options: { reset?: boolean; nickname?: string; email?: string } = {}) => {
    generation.current += 1
    pending.current?.abort()
    clearAccessToken()
    const account = options.reset ? freshAccount() : readDemo()
    if (options.reset) {
      try { localStorage.removeItem('lookie.progress.v1.demo') } catch { /* Memory-only browser. */ }
    }
    if (options.nickname) account.profile.nickname = options.nickname
    if (options.email) account.profile.email = options.email
    saveDemo(account)
    setDemoSession(true)
    setDemo(true)
    setState({ status: 'authenticated', onboarding: account.onboarding, token: '' })
  }, [])

  useEffect(() => {
    let active = true
    const expire = () => endSession(true)
    window.addEventListener(SESSION_EXPIRED_EVENT, expire)
    // Restore the external browser session after subscriptions are installed.
    // The active flag also prevents the discarded StrictMode setup from requesting.
    // OAuth callback owns session creation; restoring concurrently can cancel its exchange.
    queueMicrotask(() => { if (active && window.location.pathname !== '/oauth/callback') void refreshSession() })
    return () => {
      active = false
      window.removeEventListener(SESSION_EXPIRED_EVENT, expire)
      generation.current += 1
      pending.current?.abort()
    }
  }, [endSession, refreshSession])

  useEffect(() => {
    if (state.status !== 'authenticated') return
    const expiresAt = tokenExpiresAt(state.token)
    if (expiresAt === null) return
    const checkExpiry = () => { if (Date.now() >= expiresAt) endSession(true) }
    const timer = window.setTimeout(checkExpiry, Math.min(Math.max(0, expiresAt - Date.now()), 2_147_483_647))
    window.addEventListener('focus', checkExpiry)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', checkExpiry)
    }
  }, [state, endSession])

  return <AuthContext.Provider value={{ state, demo, startDemo, signIn, completeOAuth, signOut, signOutToSplash, refreshSession }}>
    {splashDone ? children : <Splash onContinue={()=>setSplashDone(true)}/>}
  </AuthContext.Provider>
}

