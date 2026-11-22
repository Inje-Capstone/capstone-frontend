import { useEffect } from 'react'
import { clearReconnect } from '../state/reconnect'
import { Link,NavLink,Outlet,useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ProgressProvider from '../state/ProgressProvider'
import { useProgress } from '../state/ProgressContext'
import ProfileAvatar from './ProfileAvatar'
function Layout() {
 const {progress,storageWarning}=useProgress()
 const {state}=useAuth()
 const location=useLocation()
 useEffect(()=>{clearReconnect()},[location.pathname,location.search])
 const watching=location.pathname.startsWith('/watch/')
 return <div className="rookie-app">
  {storageWarning&&<p className="storage-warning" role="status">브라우저 저장 공간을 사용할 수 없어 새로고침하면 기록이 사라질 수 있어요.</p>}
  <a href="#main-content" className="skip-link">본문으로 이동</a>
  <header className="app-nav"><Link to="/" className="wordmark">L<span>OO</span>KIE</Link>
   <nav aria-label="주요 메뉴">
    <Link to="/" className={location.pathname==='/'&&location.hash!=='#replays'?'active':''}>홈</Link>
    <Link to="/#replays" className={watching||location.hash==='#replays'?'active':''}>경기 시청</Link>
    {[['/dictionary','용어 사전'],['/quiz','퀴즈'],['/kbo','KBO 정보'],['/shop','상점']].map(([to,label])=>
      <NavLink key={to} to={to}>{label}</NavLink>)}
   </nav>
   <div className="nav-right"><NavLink to="/mypage" className="profile-link">
    <ProfileAvatar team={state.status==='authenticated'?state.onboarding.supportedTeam:null}
      image={progress.profilePhoto ? { src: progress.profilePhoto, alt: '프로필 사진' } : null}/><span>마이페이지</span>
   </NavLink></div>
  </header>
  <div id="main-content"><Outlet/></div>
 </div>
}
export default function AppLayout() {
 const {state}=useAuth()
 if(state.status!=='authenticated')return null
 let id='user'
 try{id=String(JSON.parse(atob(state.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub||'user')}catch{/* Server authentication remains authoritative. */}
 return <ProgressProvider key={id} accountKey={id}><Layout/></ProgressProvider>
}

