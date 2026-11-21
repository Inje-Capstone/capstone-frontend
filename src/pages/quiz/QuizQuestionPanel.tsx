import { Link } from 'react-router-dom'
import type { QuizFeedback } from '../../services/quizService'
import type { QuizQuestion } from '../../types/quiz'

interface Props {
  questions: QuizQuestion[]
  item?: QuizQuestion
  result?: QuizFeedback
  selected: string | null
  correctCount: number
  index: number
  busy: boolean
  error: string
  onLoad: () => void
  onAnswer: () => void
  onSelect: (choice: string) => void
  onMove: (index: number) => void
}

export function QuizQuestionPanel({ questions, item, result, selected, correctCount, index, busy, error, onLoad, onAnswer, onSelect, onMove }: Props) {
  return (
    <section className="quiz-question" aria-label="퀴즈" aria-live="polite" aria-busy={busy}>
      {!questions.length ? (
        <div className="quiz-intro">
          <p className="eyebrow">야구 규칙을 복습해요</p>
          <h1>학습 퀴즈를 풀어보세요</h1>
          <button disabled={busy} onClick={onLoad}>{busy ? '문제를 불러오는 중…' : '퀴즈 불러오기'}</button>
        </div>
      ) : item ? (
        <>
          <p className="eyebrow">{index + 1} / {questions.length}</p>
          <h1>{item.text}</h1>
          <div className="answer-options" role="group" aria-label="선택지">
            {item.choices.map((option, optionIndex) => (
              <button key={option.id} disabled={busy || !!result}
                className={'option' + (selected === option.id ? ' selected' : '') + (result?.correct && selected === option.id ? ' correct' : '')}
                aria-pressed={selected === option.id} onClick={() => onSelect(option.id)}>
                {optionIndex + 1}. {option.label}
              </button>
            ))}
          </div>
          {result ? (
            <section className="quiz-feedback">
              <strong>{result.correct ? '정답이에요!' : '오답이에요.'}</strong>
              <button onClick={() => onMove(index + 1)}>{index === questions.length - 1 ? '결과 보기' : '다음 문제'}</button>
            </section>
          ) : (
            <button disabled={busy || selected === null} onClick={onAnswer}>{busy ? '채점 결과를 기다리고 있어요…' : '정답 확인'}</button>
          )}
          {index > 0 && <button className="text-button" disabled={busy} onClick={() => onMove(index - 1)}>이전 문제</button>}
        </>
      ) : (
        <div className="quiz-summary">
          <h1>퀴즈를 완료했어요!</h1>
          <strong className="diagnosis-score">{correctCount}<span> / {questions.length}</span></strong>
          <div className="row">
            <button className="secondary-button" onClick={() => onMove(0)}>답안 다시 보기</button>
            <Link className="button secondary-button" to="/">홈으로</Link>
          </div>
        </div>
      )}
      {error && <p role="alert" className="login-error">{error}</p>}
    </section>
  )
}
