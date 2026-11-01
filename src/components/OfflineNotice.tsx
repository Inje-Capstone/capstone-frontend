import { useEffect,useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation,useNavigate } from 'react-router-dom'
import { rememberDisconnect } from '../state/reconnect'
import BaseballSpinner from './BaseballSpinner'
// Outside AuthProvider so initial session checks and public pages are also covered.
export default function OfflineNotice({children}:{children:ReactNode}) {
 const [offline,setOffline]=useState(()=>!navigator.onLine)
 const location=useLocation(),navigate=useNavigate()
 useEffect(()=>{
  const lost=()=>{
   if(location.pathname!=='/offline')rememberDisconnect(location.pathname+location.search+location.hash)
   setOffline(true);navigate('/offline',{replace:true})
  }
  const restored=()=>{
   if(!navigator.onLine)return
   setOffline(false)
   if(location.pathname==='/offline')navigate('/splash',{replace:true})
  }
  const check=()=>{if(navigator.onLine){if(location.pathname==='/offline')restored()}else lost()}
  window.addEventListener('offline',lost);window.addEventListener('online',restored);window.addEventListener('focus',check)
  document.addEventListener('visibilitychange',check)
  check()
  return ()=>{window.removeEventListener('offline',lost);window.removeEventListener('online',restored);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check)}
 },[location.pathname,location.search,location.hash,navigate])
 if(offline||location.pathname==='/offline')return <main className="connection-screen" aria-labelledby="offline-title"><BaseballSpinner/><h1 id="offline-title">인터넷 연결이 끊겼어요</h1><p>인터넷 연결을 확인해주세요.<br/>다시 연결되면 시작 화면으로 이동해요.</p><button onClick={()=>{if(navigator.onLine){setOffline(false);navigate('/splash',{replace:true})}}}>연결 다시 확인</button></main>
 return children
}
