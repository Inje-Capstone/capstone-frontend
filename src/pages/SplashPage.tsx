import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import SessionStatus from '../auth/SessionStatus'
import Splash from '../components/Splash'
export default function SplashPage() {
 const {state}=useAuth(),[continued,setContinued]=useState(false)
 if(!continued)return <Splash onContinue={()=>setContinued(true)}/>
 if(state.status==='checking'||state.status==='error')return <SessionStatus/>
 return <Navigate replace to={state.status==='authenticated'?(state.onboarding.onboardingCompleted?'/':'/onboarding'):'/login'}/>
}
