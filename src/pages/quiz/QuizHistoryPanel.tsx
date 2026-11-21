import type { QuizAttemptSummary } from '../../types/quiz'
import type { ResourceResult } from '../../hooks/useResource'
import ResourceState from '../../components/ResourceState'
import type { QuizAttempt } from '../../types/quiz'
import type { QuizQuestion } from '../../types/quiz'

interface Props {
  attempts: ResourceResult<QuizAttempt[]>
  summary: ResourceResult<QuizAttemptSummary>
  questions: QuizQuestion[]
  filter: 'all' | 'correct' | 'incorrect'
  limit: number
  onFilterChange: (filter: 'all' | 'correct' | 'incorrect') => void
  onLimitChange: (limit: number) => void
  onRefresh: () => void
}

const filters = [['all', '전체'], ['correct', '정답'], ['incorrect', '오답']] as const

export function QuizHistoryPanel({ attempts, summary, questions, filter, limit, onFilterChange, onLimitChange, onRefresh }: Props) {
  return (
    <aside className="quiz-history" aria-label="풀이 기록">
      <h2>풀이 기록</h2>
      <section className="quiz-attempt-summary" aria-label="전체 풀이 통계" aria-busy={summary.loading}>
        <ResourceState {...summary} />
        {summary.data && <dl>{([
          ['전체', summary.data.totalCount], ['정답', summary.data.correctCount], ['오답', summary.data.incorrectCount],
        ] as [string, number][]).map(([label, count]) => <div key={label}><dt>{label}</dt><dd>{count.toLocaleString()}<span>회</span></dd></div>)}</dl>}
      </section>
      <div className="quiz-history-filters" role="group" aria-label="풀이 결과 필터">
        {filters.map(([value, label]) => <button key={value} className={'chip ' + (filter === value ? 'active' : '')}
          aria-pressed={filter === value} onClick={() => onFilterChange(value)}>{label}</button>)}
      </div>
      <label className="quiz-history-limit">최근 기록
        <select aria-label="풀이 기록 조회 개수" value={limit} onChange={event => onLimitChange(Number(event.target.value))}>
          {[5, 10].map(value => <option key={value} value={value}>{value}개</option>)}
        </select>
      </label>
      <div className="quiz-attempt-list" aria-live="polite" aria-busy={attempts.loading}>
        <ResourceState {...attempts} />
        {attempts.data?.length === 0 && <p className="muted small">{filter === 'all' ? '아직 풀이 기록이 없어요.' : filter === 'correct' ? '정답 기록이 없어요.' : '오답 기록이 없어요.'}</p>}
        {attempts.data?.map((attempt, index) => {
          const question = questions.find(item => item.id === String(attempt.questionId))
          const option = question?.choices.find(item => item.id === String(attempt.selectedOptionId))
          const time = attempt.submittedAt.replace('T', ' ').slice(0, 19)
          return <article className="quiz-attempt" key={attempt.attemptId ?? `${attempt.questionId}-${attempt.submittedAt}-${index}`}>
            <div className="between"><strong>문항 {attempt.questionId}</strong><span className={'attempt-result ' + (attempt.correct ? 'correct' : 'incorrect')}>{attempt.correct ? '정답' : '오답'}</span></div>
            {question && <p className="attempt-question">{question.text}</p>}
            <p className="small">선택 {attempt.selectedOptionId}{option ? ' · ' + option.label : ''}</p>
            <time dateTime={attempt.submittedAt}>{time}</time>
          </article>
        })}
      </div>
      <p className="muted small quiz-history-note">최근 {limit}개 · 최신순<br />시각은 서버 기록 기준입니다.</p>
      <button className="secondary-button small-button" disabled={attempts.loading || summary.loading} onClick={onRefresh}>기록 새로고침</button>
    </aside>
  )
}
