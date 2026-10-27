import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ApiError, getErrorMessage } from '../api/apiClient'
import { useAuth } from '../auth/AuthContext'
import SessionStatus from '../auth/SessionStatus'
import { returnPath } from '../auth/returnPath'
import { oauthStartUrl } from '../api/oauthApi'
import googleIcon from '../assets/brands/google-round.svg'
import kakaoIcon from '../assets/brands/kakao-simple.svg'
import './LoginPage.css'

export default function LoginPage() {
  const { state, signIn, startDemo } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inFlight = useRef(false)
  const destination = returnPath(location.state)
  if (state.status === 'checking' || state.status === 'error') return <SessionStatus />
  if (state.status === 'authenticated') return <Navigate replace
    to={state.onboarding.onboardingCompleted ? destination : '/onboarding'} state={{ from: destination }} />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    setError('')
    if (!email.trim() || !password.trim()) { setError('이메일과 비밀번호를 입력해주세요.'); return }
    inFlight.current = true
    setSubmitting(true)
    try {
      // Passwords are sent exactly as entered, without trimming or persistence.
      await signIn({ email: email.trim(), password })
    } catch (error) {
      setError(error instanceof ApiError && error.status === 401
        ? '이메일 또는 비밀번호가 올바르지 않아요.' : getErrorMessage(error))
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }
  return <main className="login-page">
    <section className="login-panel" aria-labelledby="login-title">
      <header className="login-heading">
        <h1 id="login-title">LOOKIE</h1>
        <p>야구, 오늘 처음 봐도 괜찮아요</p>
      </header>
      {state.expired && <p className="login-notice" role="status">로그인이 만료되었어요. 다시 로그인해주세요.</p>}
      <form className="login-form" onSubmit={submit} aria-busy={submitting}>
        <label className="sr-only" htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" autoComplete="username" placeholder="이메일"
          required value={email} disabled={submitting} aria-describedby={error ? 'login-error' : undefined}
          onChange={event => setEmail(event.target.value)} />
        <label className="sr-only" htmlFor="password">비밀번호</label>
        <input id="password" name="password" type="password" autoComplete="current-password" placeholder="비밀번호"
          required value={password} disabled={submitting} aria-describedby={error ? 'login-error' : undefined}
          onChange={event => setPassword(event.target.value)} />
        {error && <p id="login-error" className="login-error" role="alert">{error}</p>}
        <button className="login-submit" type="submit" disabled={submitting}>{submitting ? '로그인 중…' : '로그인'}</button>
      </form>
      <div className="login-links">
        <Link to="/signup">회원가입</Link>
        <Link to="/password-reset">비밀번호 재설정</Link>
      </div>
      <div className="social-login" aria-label="간편 로그인">
        <a href={oauthStartUrl('google')} aria-label="구글로 로그인" title="구글로 로그인"><img className="google-brand" src={googleIcon} alt=""/></a>
        <a href={oauthStartUrl('kakao')} className="kakao-login" aria-label="카카오로 로그인" title="카카오로 로그인"><span className="kakao-symbol"><img src={kakaoIcon} alt=""/></span></a>
      </div>
      <p className="login-footnote">야구를 알아가는 첫걸음, LOOKIE와 함께해요.</p>
      <div className="demo-login">
        <button type="button" className="secondary-button" onClick={() => startDemo()}>서버 없이 화면 시연 시작</button>
        <small>가상 경기와 기기 내 기록으로 전체 흐름을 확인해요.</small>
        <Link to="/signup?mode=demo">시연용 회원가입부터 시작 →</Link>
      </div>
    </section>
  </main>
}

