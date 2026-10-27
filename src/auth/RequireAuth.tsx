import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import SessionStatus from './SessionStatus'

export default function RequireAuth({ allowIncomplete = false }: { allowIncomplete?: boolean }) {
  const { state } = useAuth()
  const location = useLocation()
  if (state.status === 'checking' || state.status === 'error') return <SessionStatus />
  if (state.status === 'anonymous') return <Navigate to={state.redirectTo || '/login'} replace
    state={{ from: location.pathname + location.search + location.hash }} />
  if (!allowIncomplete && !state.onboarding.onboardingCompleted) return <Navigate to="/onboarding" replace
    state={{ from: location.pathname + location.search + location.hash }} />
  return <Outlet />
}

