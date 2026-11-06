import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import SessionStatus from '../auth/SessionStatus'
import Splash from '../components/Splash'
import { reconnectDestination } from '../state/reconnect'

export default function SplashPage() {
 const { state } = useAuth()
 const navigate = useNavigate()

 if (state.status === 'checking' || state.status === 'error') {
  return <SessionStatus />
 }

 const resume = reconnectDestination()

 if (state.status === 'authenticated') {
  return (
      <Navigate
          replace
          state={{ from: resume }}
          to={state.onboarding.onboardingCompleted ? resume : '/onboarding'}
      />
  )
 }

 const anonymousDestination = ['/login', '/signup', '/password-reset'].includes(resume)
     ? resume
     : '/login'

 if (state.expired) {
  return <Navigate replace state={{ from: resume }} to={anonymousDestination} />
 }

 return (
     <Splash
         onContinue={() => navigate(anonymousDestination, { state: { from: resume } })}
     />
 )
}