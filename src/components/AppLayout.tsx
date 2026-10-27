import { Link,NavLink,Outlet,useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ProgressProvider from '../state/ProgressProvider'
import { useProgress } from '../state/ProgressContext'
function Layout() {
 const {demo,signOut}=useAuth(),{storageWarning}=useProgress()
 const location=useLocation()
 const watching=location.pathname.startsWith('/watch/')
 return <>
  {demo&&<div className="demo-banner"><span>화면 시연 모드 · 가상 경기 · 기록과 포인트는 이 기기에만 저장됩니다.</span><button onClick={signOut}>시연 종료</button></div>}
  {storageWarning&&<p className="storage-warning" role="status">브라우저 저장 공간을 사용할 수 없어 새로고침하면 기록이 사라질 수 있어요.</p>}
  <a href="#main-content" className="skip-link">본문으로 이동</a>
  <header className="app-nav"><Link to="/" className="wordmark">LOOKIE</Link>
   <nav aria-label="주요 메뉴">{[['/','홈'],['/mypage','마이페이지'],['/dictionary','용어 사전'],['/quiz','퀴즈'],['/shop','상점']].map(([to,label])=>
    <NavLink key={to} end={to==='/'} to={to} className={({isActive})=>(isActive||(to==='/'&&watching))?'active':''}>{label}</NavLink>)}</nav>
   <div className="nav-right">{watching&&<button className="secondary-button small-button" type="submit" form="end-watch">시청 종료</button>}<Link to="/mypage" className="avatar" aria-label="내 프로필"/></div>
  </header>
  <div id="main-content"><Outlet/></div>
 </>
}
export default function AppLayout() {
 const {state,demo}=useAuth()
 if(state.status!=='authenticated')return null
 let id='user'
 if(!demo){try{id=String(JSON.parse(atob(state.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub||'user')}catch{/* Separate real local records from demonstration. */}}
 return <ProgressProvider key={demo?'demo':id} demo={demo} accountKey={demo?'demo':id}><Layout/></ProgressProvider>
}

