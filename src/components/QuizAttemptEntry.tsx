import { useCallback, useState } from 'react'
import { useResource } from '../hooks/useResource'
import { quizService } from '../services/quizService'
import type { QuizAttempt } from '../types/quiz'
import ResourceState from './ResourceState'

function AttemptDetail({ attemptId }: { attemptId: number }) {
  const detail = useResource(useCallback((signal: AbortSignal) => quizService.attempt(attemptId, signal), [attemptId]))
  const value = detail.data
  return <>
    <ResourceState {...detail} />
    {value && <>
      <p>{value.questionText}</p>
      <p>내 답 · {value.options.find(option => option.optionId === value.selectedOptionId)?.text ?? value.selectedOptionId}</p>
      <p>정답 · {value.options.find(option => option.optionId === value.correctOptionId)?.text ?? value.correctOptionId}</p>
      {value.explanation && <p>해설 · {value.explanation}</p>}
    </>}
  </>
}

export default function QuizAttemptEntry({ attempt }: { attempt: QuizAttempt }) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const time = attempt.submittedAt.replace('T', ' ').slice(0, 19)
  return <details className="quiz-attempt" onToggle={event => {
    setOpen(event.currentTarget.open)
    if (event.currentTarget.open) setLoaded(true)
  }}>
    <summary>
      <strong>문항 {attempt.questionId}</strong>
      <span className={'attempt-result ' + (attempt.correct ? 'correct' : 'incorrect')}>{attempt.correct ? '정답' : '오답'}</span>
      <br /><time dateTime={attempt.submittedAt}>{time}</time>
    </summary>
    <div className="quiz-attempt-body" hidden={!open}>
      {loaded && (attempt.attemptId ? <AttemptDetail attemptId={attempt.attemptId} />
        : <p>선택한 보기 {attempt.selectedOptionId} · 상세 기록을 조회할 수 없어요.</p>)}
    </div>
  </details>
}
