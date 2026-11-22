import { useState } from 'react'
import type { ResourceResult } from '../../hooks/useResource'
import ResourceState from '../../components/ResourceState'
import type { QuizAttempt, QuizAttemptSummary } from '../../types/quiz'
import QuizAttemptEntry from '../../components/QuizAttemptEntry'

interface Props {
  attempts: ResourceResult<QuizAttempt[]>
  summary: ResourceResult<QuizAttemptSummary>
  filter: 'all' | 'correct' | 'incorrect'
  expanded: boolean
  onFilterChange: (filter: 'all' | 'correct' | 'incorrect') => void
  onToggleWidth: () => void
  onRefresh: () => void
}

const filters = [['all', '전체'], ['correct', '정답'], ['incorrect', '오답']] as const

export function QuizHistoryPanel({ attempts, summary, filter, expanded, onFilterChange, onToggleWidth, onRefresh }: Props) {
  const [order, setOrder] = useState('latest')
  const ordered = order === 'oldest' ? attempts.data?.slice().reverse() : attempts.data
  return (
    <aside className="rookie-card quiz-history" aria-label="풀이 기록">
      <div className="rookie-section-heading"><h2>풀이 기록</h2>
        <button className="secondary-button small-button rookie-history-size" aria-pressed={expanded}
          onClick={onToggleWidth}>{expanded ? '줄이기' : '넓게 보기'}</button>
      </div>
      <section className="quiz-attempt-summary" aria-label="전체 풀이 통계" aria-busy={summary.loading}>
        <ResourceState {...summary} />
        {summary.data && <dl>{([
          ['전체', summary.data.totalCount], ['정답', summary.data.correctCount], ['오답', summary.data.incorrectCount],
        ] as [string, number][]).map(([label, count]) => <div key={label}><dt>{label}</dt><dd>{count.toLocaleString()}<span>회</span></dd></div>)}</dl>}
        {Number.isFinite(summary.data?.accuracyRate) && <p className="small">정답률 {summary.data?.accuracyRate}%</p>}
      </section>
      <div className="quiz-history-filters" role="group" aria-label="풀이 결과 필터">
        {filters.map(([value, label]) => <button key={value} className={'chip ' + (filter === value ? 'active' : '')}
          aria-pressed={filter === value} onClick={() => onFilterChange(value)}>{label}</button>)}
      </div>
      <label className="quiz-history-limit">최근 10개
        <select aria-label="풀이 기록 정렬" value={order} onChange={event => setOrder(event.target.value)}>
          <option value="latest">최신순</option><option value="oldest">오래된순</option>
        </select>
      </label>
      <div className="quiz-attempt-list" aria-live="polite" aria-busy={attempts.loading}>
        <ResourceState {...attempts} />
        {attempts.data?.length === 0 && <p className="muted small">{filter === 'all' ? '아직 풀이 기록이 없어요.' : filter === 'correct' ? '정답 기록이 없어요.' : '오답 기록이 없어요.'}</p>}
        {ordered?.map((attempt, index) => <QuizAttemptEntry
          key={attempt.attemptId ?? `${attempt.questionId}-${attempt.submittedAt}-${index}`} attempt={attempt} />)}
      </div>
      <p className="muted small quiz-history-note">시각은 서버 기록 기준입니다.</p>
      <button className="secondary-button small-button" disabled={attempts.loading || summary.loading} onClick={onRefresh}>기록 새로고침</button>
    </aside>
  )
}
