import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import SessionStatus from '../auth/SessionStatus'
import Splash from '../components/Splash'
import { reconnectDestination } from '../state/reconnect'

export default function SplashPage() {
 const { state } = useAuth()
 const [continued, setContinued] = useState(false)

 if (state.status === 'checking' || state.status === 'error') {
  return <SessionStatus />
 }

 const resume = reconnectDestination()

 if (state.status === 'authenticated') {
  return <Navigate
      replace
      state={{ from: resume }}
      to={state.onboarding.onboardingCompleted ? resume : '/onboarding'}
  />
 }

 if (!continued && !state.expired) {
  return <Splash onContinue={() => setContinued(true)} />
 }

 const anonymousDestination =
     ['/login', '/signup', '/password-reset'].includes(resume)
         ? resume
         : '/login'

 return <Navigate
     replace
     state={{ from: resume }}
     to={anonymousDestination}
 />
}