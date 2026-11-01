import { Link } from 'react-router-dom'
import { useProgress } from '../state/ProgressContext'
import Character from './Character'
export default function RewardStrip() {
 const {progress}=useProgress()
 return <aside className="reward-strip" aria-label="학습 보상">
  <div className="reward-field"><Character jersey={progress.equipped.jersey}/>
   <div className="speech-bubble"><strong>이 용어, 퀴즈에 나올지도 몰라요!</strong><small>문제와 보상은 퀴즈에서 확인하세요</small></div>
  </div>
  <div className="row"><span className="points">⚾ {progress.pointsBalanceConfirmed?progress.points.toLocaleString()+'P':'포인트 준비 중'}</span><Link className="button" to="/quiz">퀴즈 풀기</Link><Link className="button secondary-button" to="/shop">상점 →</Link></div>
 </aside>
}

