import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ResourceState from '../components/ResourceState'
import { orderReplays, watchGamePath } from '../data/replayGames'
import { useResource } from '../hooks/useResource'
import { listGames } from '../services/gameService'

export default function WatchEntryPage() {
  const { state } = useAuth()
  const games = useResource(listGames)
  const team = state.status === 'authenticated' ? state.onboarding.supportedTeam : null

  if (games.loading || games.error) {
    return <main className="page"><ResourceState {...games} /></main>
  }

  const featured = orderReplays(games.data ?? [], team).find(game => game.playback)
  if (featured) return <Navigate replace to={watchGamePath(featured)} />

  return <main className="page empty-state">
    <h1>아직 시청할 수 있는 경기가 없어요.</h1>
    <p>영상이 연결된 경기가 등록되면 이 메뉴에서 바로 볼 수 있어요.</p>
    <Link className="button secondary-button" to="/#replays">경기 목록 보기</Link>
  </main>
}
