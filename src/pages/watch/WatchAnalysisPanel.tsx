import ResourceState from '../../components/ResourceState'
import type { ResourceResult } from '../../hooks/useResource'
import type { Matchup, Moment } from '../../types/mvp'

export function WatchAnalysisPanel({ matchup, moment }: { matchup: ResourceResult<Matchup>; moment: ResourceResult<Moment> }) {
  return <>
    <details className="analysis-panel" open>
      <summary>선수 · 매치업 분석 <small>타석 교체 시 갱신</small></summary>
      <ResourceState {...matchup} />
      {matchup.data?.available ? <>
        <dl>{[
          ['타자', `${matchup.data.batter || ''} — ${matchup.data.batter_line || ''}`],
          ['최근 흐름', matchup.data.recent_form], ['상대 전적', matchup.data.vs_pitcher], ['팀 흐름', matchup.data.team_form],
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '기록 없음'}</dd></div>)}</dl>
        <p className="analysis-note">{matchup.data.ai_note || '추가 설명이 없어요.'}</p>
      </> : matchup.data && <p>{matchup.data.unavailable_reason || '기록을 불러올 수 없어요.'}</p>}
    </details>
    <details className="analysis-panel" open>
      <summary>실시간 분석 <small>녹화 영상의 현재 장면</small></summary>
      <ResourceState {...moment} />
      {moment.data && <><p>{moment.data.text}</p><p className="analysis-note">{moment.data.source === 'template' ? '경기 데이터 기반 요약' : 'AI 장면 요약'}</p></>}
    </details>
  </>
}
