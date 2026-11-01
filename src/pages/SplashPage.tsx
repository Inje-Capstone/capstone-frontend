import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import SessionStatus from '../auth/SessionStatus'
import Splash from '../components/Splash'
import { reconnectDestination } from '../state/reconnect'
export default function SplashPage() {
 const {state}=useAuth(),[continued,setContinued]=useState(false)
 if(!continued)return <Splash onContinue={()=>setContinued(true)}/>
 if(state.status==='checking'||state.status==='error')return <SessionStatus/>
 const resume=reconnectDestination()
 const anonymousDestination=['/login','/signup','/password-reset'].includes(resume)?resume:'/login'
 return <Navigate state={{from:resume}} replace to={state.status==='authenticated'?(state.onboarding.onboardingCompleted?resume:'/onboarding'):anonymousDestination}/>
}
