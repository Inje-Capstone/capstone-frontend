import { useState } from 'react'
import { Link } from 'react-router-dom'
import './LoginPage.css'
export default function PasswordResetPage() {
 const [preview,setPreview]=useState(false),[email,setEmail]=useState(''),[notice,setNotice]=useState('')
 return <main className="login-page"><section className="login-panel">
  <header className="login-heading"><h1 className="small-title">{preview?'새 비밀번호 설정':'비밀번호 재설정'}</h1><p>{preview?'새로 사용할 비밀번호를 입력해주세요':'가입한 이메일로 재설정 링크를 받아요'}</p></header>
  <form className="login-form" onSubmit={e=>{e.preventDefault();setNotice('재설정 서비스 연결이 준비되지 않았어요. 실제 메일 발송이나 비밀번호 변경은 이루어지지 않습니다.')}}>
   {preview?<><input type="password" placeholder="새 비밀번호 (8~20자)" aria-label="새 비밀번호" minLength={8} maxLength={20} required autoComplete="new-password"/><input type="password" placeholder="새 비밀번호 확인" aria-label="새 비밀번호 확인" required autoComplete="new-password"/></>:<input type="email" placeholder="이메일" aria-label="이메일" required value={email} onChange={e=>setEmail(e.target.value)}/>}
   <button className="login-submit">{preview?'비밀번호 변경하기':'재설정 링크 보내기'}</button>
  </form>
  {notice&&<p className="inline-notice" role="status">{notice}</p>}
  {!preview&&<button className="text-button center-link" onClick={()=>setPreview(true)}>새 비밀번호 화면 미리보기</button>}
  <Link className="center-link" to="/login">→ 로그인으로 돌아가기</Link>
 </section></main>
}

