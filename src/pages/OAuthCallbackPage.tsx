import { useEffect,useState } from 'react'
import { Link,Navigate,useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getErrorMessage } from '../api/apiClient'
import Splash from '../components/Splash'
export default function OAuthCallbackPage() {
 const {state,completeOAuth}=useAuth(),location=useLocation()
 const [code]=useState(()=>new URLSearchParams(location.search).get('code'))
 const [error,setError]=useState(''),[finished,setFinished]=useState(false)
 useEffect(()=>{
  let active=true
  // Remove the one-time authorization code from the visible address/history immediately.
  window.history.replaceState(window.history.state,'',location.pathname)
  if(code)void completeOAuth(code).then(()=>{if(active)setFinished(true)}).catch(e=>{if(active)setError(getErrorMessage(e))})
  return ()=>{active=false}
 },[code,completeOAuth,location.pathname])
 if(finished&&state.status==='authenticated')return <Navigate replace to={state.onboarding.onboardingCompleted?'/':'/onboarding'}/>
 if(!code||error||state.status==='error')return <main className="session-screen"><h1>간편 로그인 확인</h1><p role="alert">{error||(state.status==='error'?state.message:'로그인 코드를 받지 못했어요.')}</p><Link to="/login">로그인으로 돌아가기</Link></main>
 return <Splash/>
}
