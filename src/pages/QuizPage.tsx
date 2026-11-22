import { useCallback, useState } from 'react'
import { quizService } from '../services/quizService'
import type { QuizAttemptSummary } from '../types/quiz'
import type { QuizAttempt } from '../types/quiz'
import { useResource } from '../hooks/useResource'
import { QuizHistoryPanel } from './quiz/QuizHistoryPanel'
import { QuizQuestionPanel } from './quiz/QuizQuestionPanel'
import { useQuizSession } from './quiz/useQuizSession'

export default function QuizPage() {
  const [historyFilter, setHistoryFilter] = useState<'all' | 'correct' | 'incorrect'>('all')
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const history = useResource<QuizAttempt[]>(useCallback(signal => quizService.attempts({
    limit: 10,
    correct: historyFilter === 'all' ? undefined : historyFilter === 'correct',
  }, signal), [historyFilter]))
  const summary = useResource<QuizAttemptSummary>(useCallback(signal => quizService.summary(signal), []))
  const session = useQuizSession(() => {
    history.retry()
    summary.retry()
  })

  return (
    <main className={'page quiz-layout' + (historyExpanded ? ' history-expanded' : '')}>
      <QuizQuestionPanel
        questions={session.questions}
        item={session.item}
        result={session.result}
        selected={session.selected}
        correctCount={session.correctCount}
        index={session.index}
        busy={session.busy}
        error={session.error}
        onLoad={() => void session.load()}
        onAnswer={() => void session.answer()}
        onSelect={session.setChoice}
        onMove={session.moveTo}
      />
      <QuizHistoryPanel
        attempts={history}
        summary={summary}
        filter={historyFilter}
        expanded={historyExpanded}
        onFilterChange={setHistoryFilter}
        onToggleWidth={() => setHistoryExpanded(value => !value)}
        onRefresh={() => { history.retry(); summary.retry() }}
      />
    </main>
  )
}
