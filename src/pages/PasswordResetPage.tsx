import { useState } from 'react'
import { Link } from 'react-router-dom'
import './LoginPage.css'
export default function PasswordResetPage() {
 const [email,setEmail]=useState(''),[notice,setNotice]=useState('')
 return <main className="login-page"><section className="login-panel">
  <header className="login-heading"><h1 className="small-title">비밀번호 재설정</h1><p>가입한 이메일로 재설정 링크를 받아요</p></header>
  <form className="login-form" onSubmit={e=>{e.preventDefault();setNotice('비밀번호 재설정 서비스를 준비 중이에요. 메일은 아직 발송되지 않습니다.')}}>
   <input type="email" placeholder="이메일" aria-label="이메일" required value={email} onChange={e=>setEmail(e.target.value)}/>
   <button className="login-submit">재설정 링크 보내기</button>
  </form>
  {notice&&<p className="inline-notice" role="status">{notice}</p>}
  <Link className="center-link" to="/login">→ 로그인으로 돌아가기</Link>
 </section></main>
}
