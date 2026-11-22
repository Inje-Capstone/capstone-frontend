import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import TeamIdentity from '../components/TeamIdentity'
import { teams } from '../data/choices'
import { officialClubDirectory, officialStandings, officialTeamStats, standings, standingsDate } from '../data/kbo'

const views = [
  { id: 'rank', label: 'KBO 순위' },
  { id: 'cheer', label: '응원가' },
  { id: 'analysis', label: '팀 분석' },
] as const

export default function KboPage() {
  const { state } = useAuth()
  const [search, setSearch] = useSearchParams()
  const favorite = state.status === 'authenticated' ? state.onboarding.supportedTeam : null
  const active = views.find(view => view.id === search.get('view'))?.id ?? 'rank'
  const selected = standings.find(([code]) => code === search.get('team')) ??
    standings.find(([code]) => code === favorite) ?? standings[0]
  const [club, wins, losses, draws, rate, , recent] = selected
  const nameFor = (code: string) => teams.find(team => team.code === code)?.displayName ?? code

  function setView(view: typeof active) {
    const next = new URLSearchParams(search)
    if (view === 'rank') next.delete('view')
    else next.set('view', view)
    setSearch(next)
  }

  return <main className="page rookie-kbo">
    <header className="rookie-intro">
      <h1>우리 팀의 야구가 궁금하다면.</h1>
      <p>KBO 순위와 구단별 기록을 살펴보세요.</p>
    </header>
    <div className="rookie-kbo-nav" role="group" aria-label="KBO 정보 보기">
      {views.map(view => <button key={view.id} type="button" aria-pressed={active === view.id}
        className={active === view.id ? 'button' : 'button secondary-button'}
        onClick={() => setView(view.id)}>{view.label}</button>)}
    </div>
    {active === 'rank' ? <section className="rookie-card rookie-kbo-panel">
      <div className="rookie-section-heading">
        <h2>2026 KBO 리그 순위</h2>
        <a href={officialStandings} target="_blank" rel="noreferrer">KBO 공식 순위 ↗</a>
      </div>
      <p className="muted small">{standingsDate} 기준 · 게임차는 정규시즌 기록 기준</p>
      <div className="rookie-table-scroll" tabIndex={0} aria-label="2026 KBO 리그 순위표">
        <table className="rookie-table">
          <caption className="sr-only">{standingsDate} 기준 10개 구단 순위, 출처 KBO</caption>
          <thead><tr>{['순위', '팀', '승', '패', '무', '승률', '게임차'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{standings.map(([code, win, loss, draw, pct, gap], i) =>
            <tr key={code} className={code === favorite ? 'favorite-club' : undefined}>
              <td>{i + 1}</td>
              <th scope="row"><TeamIdentity team={code} name={nameFor(code)} />
                {code === favorite && <span className="rookie-favorite-label">응원팀</span>}
              </th>
              <td>{win}</td><td>{loss}</td><td>{draw}</td><td>{pct}</td><td>{gap}</td>
            </tr>)}</tbody>
        </table>
      </div>
    </section> : active === 'cheer' ? <section className="rookie-card rookie-kbo-panel">
      <h2>우리 팀 응원가</h2>
      <p>KBO 구단 소개에서 우리 팀 공식 사이트로 이동해 응원 콘텐츠를 찾아보세요.</p>
      <a className="button" href={officialClubDirectory} target="_blank" rel="noreferrer">KBO 구단 소개 ↗</a>
    </section> : <section className="rookie-card rookie-kbo-panel">
      <div className="rookie-section-heading">
        <h2>우리 팀 기록</h2>
        <label>구단 <select value={club} onChange={event => {
          const next = new URLSearchParams(search)
          next.set('team', event.target.value)
          setSearch(next, { replace: true })
        }}>{standings.map(([code]) => <option key={code} value={code}>{nameFor(code)}</option>)}</select></label>
      </div>
      <TeamIdentity team={club} name={nameFor(club)} />
      <dl className="rookie-team-stats">
        <div><dt>시즌 성적</dt><dd>{wins}승 {draws}무 {losses}패</dd></div>
        <div><dt>승률</dt><dd>{rate}</dd></div>
        <div><dt>마지막 10경기</dt><dd>{recent}</dd></div>
      </dl>
      <p className="muted small">{standingsDate} 기준 · 출처 KBO</p>
      <a className="button" href={officialTeamStats} target="_blank" rel="noreferrer">KBO 팀 기록실 ↗</a>
    </section>}
  </main>
}
