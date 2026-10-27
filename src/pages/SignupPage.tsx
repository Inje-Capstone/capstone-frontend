import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link,Navigate,useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { signUp } from '../api/authApi'
import { getErrorMessage } from '../api/apiClient'
import SessionStatus from '../auth/SessionStatus'
import './LoginPage.css'
export default function SignupPage() {
 const {state,signIn,startDemo}=useAuth(),[params]=useSearchParams()
 const demo=params.get('mode')==='demo'
 const [values,setValues]=useState({email:'',password:'',confirm:'',nickname:''})
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[created,setCreated]=useState(false)
 if(state.status==='checking'||state.status==='error')return <SessionStatus/>
 if(state.status==='authenticated')return <Navigate to={state.onboarding.onboardingCompleted?'/':'/onboarding'} replace/>
 async function submit(event:FormEvent) {
  event.preventDefault();if(busy)return;setError('')
  const nickname=values.nickname.trim()
  if(nickname.length<2||nickname.length>20){setError('닉네임은 2~20자로 입력해주세요.');return}
  if(values.password!==values.confirm){setError('비밀번호가 일치하지 않아요.');return}
  if(demo){startDemo({reset:true,nickname,email:values.email.trim()});return}
  setBusy(true)
  try{
   if(!created){await signUp({email:values.email.trim(),password:values.password,nickname});setCreated(true)}
   await signIn({email:values.email.trim(),password:values.password})
  }catch(e){setError(getErrorMessage(e))}finally{setBusy(false)}
 }
 return <main className="login-page signup-page"><section className="login-panel">
  <header className="login-heading"><h1>LOOKIE</h1><p>야구를 알아가는 첫걸음을 시작해요</p></header>
  {demo&&<p className="inline-notice">시연용 회원가입 · 비밀번호는 저장하지 않아요.</p>}
  {created&&<p className="inline-notice">가입이 완료됐어요. 로그인만 다시 시도해주세요.</p>}
  <form className="login-form" onSubmit={submit}>
   {([['email','이메일','email'],['password','비밀번호 (8~20자)','password'],['confirm','비밀번호 확인','password'],['nickname','닉네임 (2~20자)','text']] as const).map(([key,label,type])=><label key={key} className="form-label"><span className="sr-only">{label}</span><input type={type} required placeholder={label} aria-label={label}
    autoComplete={type==='password'?'new-password':key==='email'?'email':'nickname'} minLength={type==='password'?8:key==='nickname'?2:undefined} maxLength={key==='email'?254:20}
    disabled={busy||created} value={values[key]} onChange={e=>setValues({...values,[key]:e.target.value})}/></label>)}
   {error&&<p role="alert" className="login-error">{error}</p>}
   <button className="login-submit" disabled={busy}>{busy?'처리 중…':created?'로그인 다시 시도':'가입하기'}</button>
  </form>
  <p className="login-footnote">가입 후 약관 동의와 수준 진단을 진행해요.</p>
  <Link className="center-link" to="/login">이미 계정이 있어요 → 로그인</Link>
  {!demo&&<Link className="center-link" to="/signup?mode=demo">서버 없이 시연용 회원가입 →</Link>}
 </section></main>
}

