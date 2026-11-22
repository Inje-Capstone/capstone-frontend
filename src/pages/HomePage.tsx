import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ResourceState from '../components/ResourceState'
import RookieMascot from '../components/RookieMascot'
import TeamIdentity from '../components/TeamIdentity'
import { teamForGameName } from '../data/kbo'
import { useResource } from '../hooks/useResource'
import { listGames } from '../services/gameService'
import type { PlayableGame } from '../services/gameServiceContract'
import { useProgress } from '../state/ProgressContext'

const watchUrl = (game: PlayableGame) => '/watch/' + encodeURIComponent(game.id)

export default function HomePage() {
  const { state } = useAuth()
  const { progress } = useProgress()
  const { hash } = useLocation()
  const games = useResource(useCallback((signal: AbortSignal) => listGames(signal), []))
  const [expanded, setExpanded] = useState(false)
  const team = state.status === 'authenticated' ? state.onboarding.supportedTeam : null
  const isFavorite = (game: PlayableGame) => Boolean(team && (
    teamForGameName(game.home_team)?.code === team || teamForGameName(game.away_team)?.code === team
  ))
  const ordered = [...(games.data ?? [])].sort((a, b) =>
    Number(isFavorite(b)) - Number(isFavorite(a)) || b.date.localeCompare(a.date))
  const featured = ordered.find(game => game.playback)
  const visible = ordered.slice(0, expanded ? undefined : 6)

  useEffect(() => {
    if (hash === '#replays') document.getElementById('replays')?.scrollIntoView()
  }, [hash])

  return <main className="page rookie-home">
    <header className="rookie-intro">
      <h1>야구, 오늘 처음 봐도 괜찮아요.</h1>
      <p>좋아하는 팀의 경기부터 가볍게 시작해 볼까요?</p>
    </header>
    <div className="rookie-home-grid">
      <section className="rookie-feature">
        <p className="rookie-kicker">{featured && isFavorite(featured) ? '응원팀 추천 경기' : '경기 리플레이'}</p>
        <h2>좋아하는 팀과<br />첫 번째 플레이!</h2>
        <p>{featured ? <>{featured.home_team} vs {featured.away_team} · {featured.date} · {featured.stadium}</>
          : '경기 장면을 보면서 야구를 하나씩 알아가요.'}</p>
        {featured ? <Link className="button" to={watchUrl(featured)}>
          {progress.playback[featured.id] > 0 ? '이어보기' : '경기 보러 가기'} ↗
        </Link> : <a className="button" href="#replays">경기 목록 보기 ↓</a>}
        {featured?.score_text && <p className="rookie-feature-score">{featured.score_text}</p>}
      </section>
      <aside className="rookie-coach">
        <h2>잘 몰라도,<br />같이 보면 재밌지!</h2>
        <p>야구가 궁금한 순간,<br />내가 옆에서 알려줄게.</p>
        <RookieMascot className="rookie-coach-mascot" />
        <Link className="button secondary-button" to={featured ? watchUrl(featured) + '#rookie-chat' : '/dictionary'}>
          {featured ? '루키와 이야기하기' : '용어 사전 보기'} ↗
        </Link>
      </aside>
    </div>
    <section id="replays" className="rookie-home-section" aria-labelledby="replays-title">
      <div className="rookie-section-heading">
        <h2 id="replays-title">지난 경기, 다시 보기</h2>
        <Link className="button secondary-button small-button" to="/mypage">응원팀 변경 ↗</Link>
      </div>
      <ResourceState {...games} />
      {games.data?.length === 0 && <p className="muted">아직 등록된 경기가 없어요.</p>}
      <ul className="rookie-replay-list">{visible.map(game => <li key={game.id} className="rookie-card rookie-replay">
        <div className="rookie-replay-teams">
          <TeamIdentity team={teamForGameName(game.home_team)?.code ?? null} name={game.home_team} />
          <span aria-hidden="true">vs</span>
          <TeamIdentity team={teamForGameName(game.away_team)?.code ?? null} name={game.away_team} />
        </div>
        <p>{game.score_text ?? <>{game.home_team} vs {game.away_team}</>}</p>
        <small>{game.date} · {game.stadium}{isFavorite(game) ? ' · 응원팀' : ''}</small>
        {game.playback ? <Link to={watchUrl(game)} className="button secondary-button small-button"
          aria-label={game.home_team + ' 대 ' + game.away_team + ' 경기 보기'}>경기 보기 ↗</Link>
          : <small className="muted">영상 미확보</small>}
      </li>)}</ul>
      {!expanded && ordered.length > visible.length &&
        <button className="secondary-button" onClick={() => setExpanded(true)}>더 보기</button>}
    </section>
    <section className="rookie-home-section" aria-labelledby="learning-title">
      <h2 id="learning-title">보는 재미에서, 아는 재미로.</h2>
      <div className="rookie-learning">
        <Link to="/quiz" className="rookie-card"><strong>오늘의 야구 퀴즈 ↗</strong><span>방금 본 장면을 복습해요.</span></Link>
        <Link to="/dictionary" className="rookie-card"><strong>모르는 단어 찾기 ↗</strong><span>야구가 쉬워지는 한 문장</span></Link>
        <Link to="/kbo" className="rookie-card"><strong>우리 팀 더 알아보기 ↗</strong><span>순위 · 응원가 · 팀 분석</span></Link>
      </div>
    </section>
    {ordered.some(game => game.has_video && !game.playback) &&
      <p className="page-note">영상 제공 주소가 연결된 경기부터 볼 수 있어요.</p>}
  </main>
}
