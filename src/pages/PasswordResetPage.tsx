import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError, getErrorMessage } from '../api/apiClient'
import { confirmPasswordReset, requestPasswordReset } from '../api/authApi'
import './LoginPage.css'

export default function PasswordResetPage() {
 const [searchParams, setSearchParams] = useSearchParams()
 const [token, setToken] = useState(() => searchParams.get('token'))
 const [email, setEmail] = useState('')
 const [emailFormatInvalid, setEmailFormatInvalid] = useState(false)
 const [password, setPassword] = useState('')
 const [confirmation, setConfirmation] = useState('')
 const [busy, setBusy] = useState(false)
 const [complete, setComplete] = useState(false)
 const [notice, setNotice] = useState('')
 const [error, setError] = useState('')

 useEffect(() => {
  if (!searchParams.has('token')) return
  const next = new URLSearchParams(searchParams)
  next.delete('token')
  setSearchParams(next, { replace: true })
 }, [searchParams, setSearchParams])

 const invalidLink = token !== null && !/^[A-Za-z0-9_-]{43}$/.test(token)

 async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  if (busy || complete || invalidLink) return

  setError('')
  setNotice('')

  if (token !== null && password !== confirmation) {
   setError('새 비밀번호와 확인 값이 일치하지 않아요.')
   return
  }

  setBusy(true)
  try {
   if (token !== null) {
    await confirmPasswordReset(token, password)
    setToken(null)
    setPassword('')
    setConfirmation('')
    setComplete(true)
    setNotice('비밀번호를 변경했어요. 새 비밀번호로 로그인해 주세요.')
   } else {
    await requestPasswordReset(email.trim())
    setNotice('가입된 이메일이라면 재설정 링크를 보내드려요.')
   }
  } catch (err) {
   if (err instanceof ApiError && err.status === 404) {
    setError('지금은 비밀번호 재설정을 이용할 수 없어요.')
   } else if (err instanceof ApiError && err.status === 400 && token !== null) {
    setError('링크가 만료됐거나 이미 사용됐어요. 새 링크를 요청해 주세요.')
   } else {
    setError(getErrorMessage(err))
   }
  } finally {
   setBusy(false)
  }
 }

 return (
     <main className="login-page">
      <section className="login-panel">
       <header className="login-heading">
        <h1 className="small-title">비밀번호 재설정</h1>
        {!complete && (
            <p>{token === null ? '가입한 이메일로 재설정 링크를 받아요' : '새 비밀번호를 입력해 주세요'}</p>
        )}
       </header>

       {invalidLink && <p className="login-error" role="alert">유효하지 않은 재설정 링크예요.</p>}

       {!complete && !invalidLink && (
           <form className="login-form" onSubmit={submit}>
            {token === null ? (
                <>
                 <input
                    type="email" aria-label="이메일" placeholder="이메일"
                    data-form-hints="off" autoComplete="email" maxLength={254} required
                    aria-invalid={emailFormatInvalid || undefined}
                    aria-describedby={emailFormatInvalid ? 'reset-email-format-error' : undefined}
                    value={email}
                    onChange={event => {
                     setEmail(event.target.value)
                     setEmailFormatInvalid(false)
                     setError('')
                     setNotice('')
                    }}
                    onInvalid={event => {
                     event.preventDefault()
                     if (!event.currentTarget.validity.typeMismatch) return
                     setEmailFormatInvalid(true)
                     event.currentTarget.focus()
                    }}
                 />
                 {emailFormatInvalid && (
                     <p id="reset-email-format-error" className="login-error" role="alert">
                      이메일 주소 형식을 확인해 주세요.
                     </p>
                 )}
                </>
            ) : (
                <>
                 <input
                     type="password" aria-label="새 비밀번호" placeholder="새 비밀번호 (8~20자)"
                     autoComplete="new-password" minLength={8} maxLength={20} required
                     value={password} onChange={e => setPassword(e.target.value)}
                 />
                 <input
                     type="password" aria-label="새 비밀번호 확인" placeholder="새 비밀번호 확인"
                     autoComplete="new-password" minLength={8} maxLength={20} required
                     value={confirmation} onChange={e => setConfirmation(e.target.value)}
                 />
                </>
            )}
            <button type="submit" className="login-submit" disabled={busy || (token === null && !email.trim())}>
             {busy ? '처리 중…' : token === null ? '재설정 링크 보내기' : '새 비밀번호 저장'}
            </button>
           </form>
       )}

       {error && <p className="login-error" role="alert">{error}</p>}
       {notice && <p className="inline-notice" role="status">{notice}</p>}
       {token !== null && (
           <button type="button" className="center-link" disabled={busy} onClick={() => {
            setToken(null)
            setPassword('')
            setConfirmation('')
            setError('')
           }}>
            새 링크 요청하기
           </button>
       )}
       <Link className="center-link" to="/login">→ 로그인으로 돌아가기</Link>
      </section>
     </main>
 )
}
