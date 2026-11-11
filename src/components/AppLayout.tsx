import { useEffect } from 'react'
import { clearReconnect } from '../state/reconnect'
import { Link,NavLink,Outlet,useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ProgressProvider from '../state/ProgressProvider'
import { useProgress } from '../state/ProgressContext'
import ProfileAvatar from './ProfileAvatar'
function Layout() {
 const {storageWarning}=useProgress()
 const {state}=useAuth()
 const location=useLocation()
 useEffect(()=>{clearReconnect()},[location.pathname,location.search])
 const watching=location.pathname.startsWith('/watch/')
 return <>
  {storageWarning&&<p className="storage-warning" role="status">브라우저 저장 공간을 사용할 수 없어 새로고침하면 기록이 사라질 수 있어요.</p>}
  <a href="#main-content" className="skip-link">본문으로 이동</a>
  <header className="app-nav"><Link to="/" className="wordmark">LOOKIE</Link>
   <nav aria-label="주요 메뉴">{[['/','홈'],['/dictionary','용어 사전'],['/quiz','퀴즈'],['/shop','상점'],['/mypage','마이페이지']].map(([to,label])=>
    <NavLink key={to} end={to==='/'} to={to} className={({isActive})=>(isActive||(to==='/'&&watching))?'active':''}>{label}</NavLink>)}</nav>
   <div className="nav-right">{watching&&<button className="secondary-button small-button" type="submit" form="end-watch">시청 종료</button>}<Link to="/mypage" className="profile-link" aria-label="내 프로필"><ProfileAvatar team={state.status==='authenticated'?state.onboarding.supportedTeam:null}/></Link></div>
  </header>
  <div id="main-content"><Outlet/></div>
 </>
}
export default function AppLayout() {
 const {state}=useAuth()
 if(state.status!=='authenticated')return null
 let id='user'
 try{id=String(JSON.parse(atob(state.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub||'user')}catch{/* Server authentication remains authoritative. */}
 return <ProgressProvider key={id} accountKey={id}><Layout/></ProgressProvider>
}

