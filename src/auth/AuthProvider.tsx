import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { clearReconnect } from '../state/reconnect'
import { exchangeOAuthCode } from '../api/oauthApi'
import Splash from '../components/Splash'
import { login } from '../api/authApi'
import { getOnboardingStatus } from '../api/onboardingApi'
import { ApiError, getErrorMessage, SESSION_EXPIRED_EVENT } from '../api/apiClient'
import { AuthContext } from './AuthContext'
import type { AuthState } from './AuthContext'
import { clearAccessToken, getAccessToken, setAccessToken, tokenExpiresAt } from './tokenStorage'
import type { LoginRequest } from '../types/backend'
import { useLocation, useNavigate } from 'react-router-dom'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [initialLocationKey] = useState(location.key)
  const [state, setState] = useState<AuthState>({ status: 'checking' })
  const [splashDone,setSplashDone]=useState(()=>['/splash','/oauth/callback'].includes(window.location.pathname))
  const generation = useRef(0)
  const pending = useRef<AbortController | null>(null)

  const endSession = useCallback((expired: boolean, redirectTo?: '/splash') => {
    generation.current += 1
    pending.current?.abort()
    clearAccessToken()
    if(!expired)clearReconnect()
    setState({ status: 'anonymous', expired, redirectTo })
  }, [])
  const signOutToSplash = useCallback(() => endSession(false,'/splash'), [endSession])
  const signOut = useCallback(() => endSession(false), [endSession])

  const refreshSession = useCallback(async () => {
    const current = ++generation.current
    pending.current?.abort()
    const token = getAccessToken()
    if (!token) { setState({ status: 'anonymous', expired: false }); return }
    const expiresAt = tokenExpiresAt(token)
    if (expiresAt !== null && expiresAt <= Date.now()) { endSession(true); return }
    const controller = new AbortController()
    pending.current = controller
    setState({ status: 'checking' })
    try {
      const onboarding = await getOnboardingStatus(controller.signal)
      if (current === generation.current) {
        setSplashDone(true)
        setState({ status: 'authenticated', onboarding, token })
      }
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
    setAccessToken(result.accessToken)
    // If status lookup fails, preserve authentication and offer retry.
    await refreshSession()
  }, [refreshSession])

  const completeOAuth = useCallback(async (code:string) => {
    const current=++generation.current
    const result=await exchangeOAuthCode(code)
    if(current!==generation.current)return
    setAccessToken(result.accessToken)
    await refreshSession()
  },[refreshSession])

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

  const showSplash =
      !splashDone &&
      location.key === initialLocationKey &&
      state.status === 'anonymous' &&
      !state.expired &&
      !state.redirectTo

  function continueFromSplash() {
    const from = location.pathname + location.search + location.hash
    const isAuthPage = ['/login', '/signup', '/password-reset'].includes(location.pathname)

    if (isAuthPage) {
      navigate(from, { state: location.state })
    } else {
      navigate('/login', { state: { from } })
    }
  }

  return (
      <AuthContext.Provider value={{ state, signIn, completeOAuth, signOut, signOutToSplash, refreshSession }}>
        {showSplash ? <Splash onContinue={continueFromSplash} /> : children}
      </AuthContext.Provider>
  )
}
