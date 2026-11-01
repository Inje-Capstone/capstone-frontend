import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getErrorMessage } from '../api/apiClient'
import Splash from '../components/Splash'

function getOAuthErrorMessage(errorCode: string): string {
 switch (errorCode) {
  case 'SOCIAL_ACCOUNT_LINK_REQUIRED':
   return '이미 이메일로 가입된 계정입니다. 기존 이메일과 비밀번호로 로그인해주세요.'

  case 'OAUTH_AUTHENTICATION_FAILED':
   return '간편 로그인 인증에 실패했어요. 다시 시도해주세요.'

  default:
   return '간편 로그인을 완료하지 못했어요. 다시 시도해주세요.'
 }
}

export default function OAuthCallbackPage() {
 const { state, completeOAuth, signOut } = useAuth()
 const location = useLocation()

 // 주소에서 쿼리 문자열을 제거하기 전에 최초 값을 보관한다.
 const [{ code, oauthError }] = useState(() => {
  const params = new URLSearchParams(location.search)

  return {
   code: params.get('code'),
   oauthError: params.get('error'),
  }
 })

 const [exchangeError, setExchangeError] = useState('')
 const [finished, setFinished] = useState(false)

 useEffect(() => {
  let active = true

  // 일회용 코드와 오류 파라미터를 주소창 및 현재 기록에서 제거한다.
  window.history.replaceState(
      window.history.state,
      '',
      location.pathname,
  )

  // 정리된 Effect에서는 로그인 처리를 시작하지 않는다.
  queueMicrotask(() => {
   if (!active) return

   // 실패한 콜백에서는 코드 교환 없이 익명 상태로 전환한다.
   if (oauthError !== null || !code) {
    signOut()
    return
   }

   void completeOAuth(code)
       .then(() => {
        if (active) {
         setFinished(true)
        }
       })
       .catch((error: unknown) => {
        if (!active) return

        signOut()
        setExchangeError(getErrorMessage(error))
       })
  })

  return () => {
   active = false
  }
 }, [
  code,
  oauthError,
  completeOAuth,
  signOut,
  location.pathname,
 ])

 if (finished && state.status === 'authenticated') {
  return (
      <Navigate
          replace
          to={
           state.onboarding.onboardingCompleted
               ? '/'
               : '/onboarding'
          }
      />
  )
 }

 let errorMessage = ''

 if (oauthError !== null) {
  errorMessage = getOAuthErrorMessage(oauthError)
 } else if (!code) {
  errorMessage = '로그인 코드를 받지 못했어요. 다시 시도해주세요.'
 } else if (exchangeError) {
  errorMessage = exchangeError
 } else if (state.status === 'error') {
  errorMessage = state.message
 } else if (finished && state.status === 'anonymous') {
  errorMessage = '로그인을 완료하지 못했어요. 다시 시도해주세요.'
 }

 if (errorMessage) {
  return (
      <main className="session-screen">
       <h1>간편 로그인 확인</h1>
       <p role="alert">{errorMessage}</p>
       <Link to="/login" replace onClick={signOut}>
        로그인으로 돌아가기
       </Link>
      </main>
  )
 }

 return <Splash />
}