import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../api/apiClient'
import { quizService } from '../services/quizService'
import type { QuizFeedback } from '../services/quizService'
import type { QuizQuestion } from '../types/quiz'

export default function QuizPage() {
 const [questions, setQuestions] = useState<QuizQuestion[]>([])
 const [answers, setAnswers] = useState<Record<string, QuizFeedback>>({})
 const [index, setIndex] = useState(0)
 const [choice, setChoice] = useState<string | null>(null)
 const [busy, setBusy] = useState(false)
 const [error, setError] = useState('')
 const lock = useRef(false)

 const item = questions[index]
 const result = item ? answers[item.id] : undefined
 const selected = result?.choiceId ?? choice
 const correctCount = Object.values(answers).filter(answer => answer.correct).length

 async function load() {
  if (lock.current) return
  lock.current = true
  setBusy(true)
  setError('')
  try {
   const loaded = await quizService.load()
   if (!loaded.length) {
    setError('현재 풀 수 있는 퀴즈가 없어요.')
    return
   }
   setQuestions(loaded)
   setAnswers({})
   setIndex(0)
   setChoice(null)
  } catch (e) {
   setError(getErrorMessage(e))
  } finally {
   lock.current = false
   setBusy(false)
  }
 }

 async function answer() {
  if (!item || choice === null || result || lock.current) return
  lock.current = true
  setBusy(true)
  setError('')
  try {
   const feedback = await quizService.submit(item.id, choice)
   setAnswers(previous => ({ ...previous, [item.id]: feedback }))
  } catch (e) {
   setError(getErrorMessage(e))
  } finally {
   lock.current = false
   setBusy(false)
  }
 }

 function moveTo(nextIndex: number) {
  setIndex(nextIndex)
  setChoice(null)
  setError('')
 }

 return (
     <main className="page quiz-layout">
      <aside className="quiz-history">
       <h2>풀이 기록</h2>
       <p className="muted small">풀이 기록 조회는 준비 중이에요.</p>
      </aside>

      <section className="quiz-question" aria-live="polite" aria-busy={busy}>
       {!questions.length ? (
           <div className="quiz-intro">
            <p className="eyebrow">야구 규칙을 복습해요</p>
            <h1>학습 퀴즈를 풀어보세요</h1>
            <button disabled={busy} onClick={() => void load()}>
             {busy ? '문제를 불러오는 중…' : '퀴즈 불러오기'}
            </button>
           </div>
       ) : item ? (
           <>
            <p className="eyebrow">{index + 1} / {questions.length}</p>
            <h1>{item.text}</h1>
            <div className="answer-options" role="group" aria-label="선택지">
             {item.choices.map((option, i) => (
                 <button
                     key={option.id}
                     disabled={busy || !!result}
                     className={
                         'option' +
                         (selected === option.id ? ' selected' : '') +
                         (result?.correct && selected === option.id ? ' correct' : '')
                     }
                     aria-pressed={selected === option.id}
                     onClick={() => setChoice(option.id)}
                 >
                  {i + 1}. {option.label}
                 </button>
             ))}
            </div>

            {result ? (
                <section className="quiz-feedback">
                 <strong>{result.correct ? '정답이에요!' : '오답이에요.'}</strong>
                 <button onClick={() => moveTo(index + 1)}>
                  {index === questions.length - 1 ? '결과 보기' : '다음 문제'}
                 </button>
                </section>
            ) : (
                <button disabled={busy || choice === null} onClick={() => void answer()}>
                 {busy ? '채점 결과를 기다리고 있어요…' : '정답 확인'}
                </button>
            )}

            {index > 0 && (
                <button className="text-button" disabled={busy} onClick={() => moveTo(index - 1)}>
                 이전 문제
                </button>
            )}
           </>
       ) : (
           <div className="quiz-summary">
            <h1>퀴즈를 완료했어요!</h1>
            <strong className="diagnosis-score">
             {correctCount}<span> / {questions.length}</span>
            </strong>
            <div className="row">
             <button className="secondary-button" onClick={() => moveTo(0)}>답안 다시 보기</button>
             <Link to="/">홈으로</Link>
            </div>
           </div>
       )}

       {error && <p role="alert" className="login-error">{error}</p>}
      </section>
     </main>
 )
}