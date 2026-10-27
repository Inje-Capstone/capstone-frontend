import { useEffect,useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import Modal from './Modal'
import BaseballSpinner from './BaseballSpinner'
export default function OfflineNotice() {
 const {demo}=useAuth()
 const [dismissed,setDismissed]=useState(false)
 const [offline,setOffline]=useState(()=>!navigator.onLine)
 useEffect(()=>{
  const lost=()=>{setOffline(true);setDismissed(false)}
  const restored=()=>{setOffline(false);window.dispatchEvent(new Event('lookie:retry'))}
  window.addEventListener('offline',lost);window.addEventListener('online',restored)
  return ()=>{window.removeEventListener('offline',lost);window.removeEventListener('online',restored)}
 },[])
 if(!offline)return null
 if(demo&&dismissed)return <div className="offline-banner" role="status">인터넷 연결이 끊겼어요. 시연 모드는 계속 사용할 수 있어요.</div>
 return <Modal title="인터넷 연결이 끊겼어요" onClose={()=>{if(navigator.onLine)setOffline(false);else if(demo)setDismissed(true)}}>
  <div className="offline-card"><BaseballSpinner/><p>연결 상태를 확인해주세요.<br/>보던 위치와 학습 기록은 유지돼요.</p><button onClick={()=>{if(navigator.onLine)window.location.reload()}}>다시 시도</button>{demo&&<button className="text-button" onClick={()=>setDismissed(true)}>시연 계속하기</button>}</div>
 </Modal>
}
