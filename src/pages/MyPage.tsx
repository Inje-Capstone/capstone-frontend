import { useCallback,useState } from 'react'
import { deleteAccount } from '../services/accountService'
import { clearDemoAccount } from '../demo/demoAccount'
import { clearDemoQuizzes } from '../demo/quizRepository'
import { useAuth } from '../auth/AuthContext'
import { useProgress } from '../state/ProgressContext'
import { getProfile,getTeams,getLevels,updateProfile } from '../api/userApi'
import { getErrorMessage } from '../api/apiClient'
import { useResource } from '../hooks/useResource'
import { categories,levels,teams } from '../data/choices'
import ResourceState from '../components/ResourceState'
import Modal from '../components/Modal'
import type { LearningLevel,SupportedTeam } from '../types/backend'
type Panel='nickname'|'level'|'team'|'categories'|'settings'|'password'|'delete'|'logout'|'reset'|''
export default function MyPage() {
 const {demo,signOut,signOutToSplash,refreshSession,startDemo}=useAuth(),{progress,setCategories,setReview,reset,clearLocalData}=useProgress()
 const profile=useResource(useCallback(()=>getProfile(),[]))
 const teamOptions=useResource(useCallback(()=>getTeams(),[])),levelOptions=useResource(useCallback(()=>getLevels(),[]))
 const [panel,setPanel]=useState<Panel>(''),[value,setValue]=useState(''),[interest,setInterest]=useState(progress.categories)
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 function open(next:Panel,initial='') {setPanel(next);setValue(initial);setError('')}
 async function save(field:'nickname'|'supported-team'|'learning-level'|'game-notification',next:unknown,refresh=true) {
  if(busy)return;setBusy(true);setError('')
  try{await updateProfile(field,next);if(field!=='game-notification')setPanel('');profile.retry();if(refresh)await refreshSession();setNotice('변경 내용을 저장했어요.')}
  catch(e){setError(getErrorMessage(e))}finally{setBusy(false)}
 }
 async function withdraw() {
  if(busy)return;setBusy(true);setError('')
  try {await deleteAccount();clearLocalData();if(demo){clearDemoAccount();clearDemoQuizzes()}signOutToSplash()}
  catch(e){setError(getErrorMessage(e))}finally{setBusy(false)}
 }
 const user=profile.data
 return <main className="page profile-page"><div className="profile-content"><ResourceState {...profile}/>
 {user&&<><header className="profile-heading"><div className="avatar large"/><div><button className="text-button nickname-button" onClick={()=>open('nickname',user.nickname)}>{user.nickname} <small>수정</small></button><p className="muted small">{user.email||'이메일 미제공'}</p></div></header>
 <div className="profile-rows">
  <button className="profile-row" onClick={()=>open('level',user.learningLevel||'INTRODUCTORY')}><span>야구 지식 수준</span><span>{user.learningLevelDisplayName||levels.find(l=>l.code===user.learningLevel)?.displayName||'미설정'} <b>변경 ›</b></span></button>
  <button className="profile-row" onClick={()=>{setInterest(progress.categories);open('categories')}}><span>관심 카테고리</span><span>{progress.categories.join(', ')||'전체'} <b>변경 ›</b></span></button>
  <button className="profile-row" onClick={()=>open('team',user.supportedTeam||'NONE')}><span>응원팀</span><span>{user.supportedTeamDisplayName||teams.find(t=>t.code===user.supportedTeam)?.displayName||'미선택'} <b>변경 ›</b></span></button>
  <button className="profile-row" onClick={()=>open('settings')}><span>설정</span><span>›</span></button>
  <button className="profile-row" onClick={()=>open('logout')}><span>로그아웃</span><span>›</span></button>
 </div>{demo&&<button className="text-button reset-demo" onClick={()=>open('reset')}>시연 기록 초기화하고 온보딩부터 다시 시작</button>}
 {notice&&<p role="status" className="inline-notice">{notice}</p>}
 </>}
 </div>
 {panel&&<Modal className={panel==='settings'?'settings-modal':panel==='delete'?'withdrawal-modal':''} title={{nickname:'닉네임 변경',level:'야구 지식 수준',team:'응원팀 선택',categories:'관심 카테고리',settings:'설정',password:'비밀번호 변경',delete:'정말 탈퇴하시겠어요?',logout:'로그아웃',reset:'시연 처음부터 시작'}[panel]} onClose={()=>{if(!busy)setPanel('')}}>
 {panel==='nickname'&&<form onSubmit={e=>{e.preventDefault();if(value.trim().length<2){setError('닉네임은 2~20자로 입력해주세요.');return}void save('nickname',value.trim(),false)}}><label>닉네임<input required minLength={2} maxLength={20} value={value} onChange={e=>setValue(e.target.value)}/></label><button disabled={busy}>저장</button></form>}
 {panel==='level'&&<><ResourceState {...levelOptions}/><div className="answer-options">{levelOptions.data?.map(l=><button key={l.code} className={'option '+(value===l.code?'selected':'')} onClick={()=>setValue(l.code)}>{l.displayName}</button>)}</div><button disabled={busy} onClick={()=>void save('learning-level',value as LearningLevel)}>저장</button></>}
 {panel==='team'&&<><ResourceState {...teamOptions}/><div className="team-grid">{teamOptions.data?.map(t=><button key={t.code} className={'team-option '+(value===t.code?'selected':'')} onClick={()=>setValue(t.code||'NONE')}>{t.displayName.split(' ')[0]}</button>)}</div><button disabled={busy} onClick={()=>void save('supported-team',value as SupportedTeam)}>저장</button></>}
 {panel==='categories'&&<><div className="chips">{categories.map(c=><button key={c} className={'chip '+(interest.includes(c)?'active':'')} aria-pressed={interest.includes(c)} onClick={()=>setInterest(interest.includes(c)?interest.filter(x=>x!==c):[...interest,c])}>{c}</button>)}</div><p className="muted small">관심 카테고리는 이 기기에 저장돼요.</p><button onClick={()=>{setCategories(interest);setPanel('')}}>저장</button></>}
 {panel==='settings'&&<div className="settings-list">
  <button className={'setting-button '+(progress.reviewEnabled?'enabled':'')} role="switch" aria-checked={progress.reviewEnabled} onClick={()=>setReview(!progress.reviewEnabled)}>시청 후 룰 복습 <strong>{progress.reviewEnabled?'ON':'OFF'}</strong></button>
  <button className={'setting-button '+(user?.gameNotificationEnabled?'enabled':'')} role="switch" aria-checked={user?.gameNotificationEnabled||false} disabled={busy} onClick={()=>void save('game-notification',!user?.gameNotificationEnabled,false)}>새 경기 알림 <strong>{user?.gameNotificationEnabled?'ON':'OFF'}</strong></button>
  <button className="setting-button" onClick={()=>open('password')}>비밀번호 변경</button>
  <button className="text-button withdrawal-link" onClick={()=>open('delete')}>회원 탈퇴</button>
 </div>}
 {panel==='password'&&<form onSubmit={e=>{e.preventDefault();setError('비밀번호 변경 API가 아직 연결되지 않았어요. 실제 비밀번호는 변경되지 않습니다.')}}><label>새 비밀번호<input type="password" required minLength={8} maxLength={20} autoComplete="new-password"/></label><label>새 비밀번호 확인<input type="password" required autoComplete="new-password"/></label><button>비밀번호 변경하기</button></form>}
 {panel==='delete'&&<><p className="withdrawal-copy">탈퇴하면 계정과 학습 기록이 삭제돼요.<br/>삭제된 정보는 복구할 수 없어요.</p><div className="withdrawal-actions"><button className="secondary-button" disabled={busy} onClick={()=>setPanel('')}>취소</button><button className="withdrawal-confirm" disabled={busy} onClick={()=>void withdraw()}>{busy?'처리 중…':'탈퇴하기'}</button></div>{demo&&<p className="small muted">시연 계정만 삭제됩니다.</p>}</>}
 {panel==='logout'&&<><p>로그아웃할까요? 저장된 학습 기록은 유지돼요.</p><div className="row"><button onClick={signOut}>로그아웃</button><button className="secondary-button" onClick={()=>setPanel('')}>취소</button></div></>}
 {panel==='reset'&&<><p>시연 프로필·퀴즈·포인트·구매 기록을 초기화해요.</p><button onClick={()=>{clearDemoQuizzes();reset();startDemo({reset:true})}}>초기화하고 시작</button></>}
 {error&&<p role="alert" className="login-error">{error}</p>}
 </Modal>}
 </main>
}

