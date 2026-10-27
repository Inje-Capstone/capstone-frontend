import Splash from '../components/Splash'
import { useAuth } from './AuthContext'

export default function SessionStatus() {
  const { state, refreshSession, signOut } = useAuth()
  if (state.status === 'error') return <main className="session-screen">
    <h1>로그인 상태를 확인하지 못했어요</h1>
    <p role="alert">{state.message}</p>
    <div className="session-actions">
      <button onClick={() => void refreshSession()}>다시 시도</button>
      <button className="secondary-button" onClick={signOut}>로그인으로 돌아가기</button>
    </div>
  </main>
  return <Splash/>
}
