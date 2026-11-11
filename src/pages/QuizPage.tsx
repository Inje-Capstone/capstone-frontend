import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../api/apiClient'
import { quizService } from '../services/quizService'
import type { QuizFeedback } from '../services/quizService'
import type { QuizQuestion } from '../types/quiz'
import { useResource } from '../hooks/useResource'
import ResourceState from '../components/ResourceState'

export default function QuizPage() {
 const [questions, setQuestions] = useState<QuizQuestion[]>([])
 const [answers, setAnswers] = useState<Record<string, QuizFeedback>>({})
 const [index, setIndex] = useState(0)
 const [choice, setChoice] = useState<string | null>(null)
 const [busy, setBusy] = useState(false)
 const [error, setError] = useState('')
 const lock = useRef(false)
 const [historyFilter, setHistoryFilter] = useState<'all' | 'correct' | 'incorrect'>('all')
 const [historyLimit, setHistoryLimit] = useState(20)
 const history = useResource(useCallback((signal: AbortSignal) => quizService.attempts({
  limit: historyLimit, correct: historyFilter === 'all' ? undefined : historyFilter === 'correct',
 }, signal), [historyLimit, historyFilter]))
 const summary = useResource(useCallback((signal: AbortSignal) => quizService.summary(signal), []))

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
   history.retry()
   summary.retry()
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


      <section className="quiz-question" aria-label="퀴즈" aria-live="polite" aria-busy={busy}>
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
             <Link className="button secondary-button" to="/">홈으로</Link>
            </div>
           </div>
       )}

       {error && <p role="alert" className="login-error">{error}</p>}
      </section>
      <aside className="quiz-history" aria-label="풀이 기록">
       <h2>풀이 기록</h2>
       <section className="quiz-attempt-summary" aria-label="전체 풀이 통계" aria-busy={summary.loading}>
        <ResourceState {...summary}/>
        {summary.data && <dl>{[['전체', summary.data.totalCount], ['정답', summary.data.correctCount], ['오답', summary.data.incorrectCount]].map(([label, count]) =>
         <div key={label}><dt>{label}</dt><dd>{Number(count).toLocaleString()}<span>회</span></dd></div>)}</dl>}
       </section>
       <div className="quiz-history-filters" role="group" aria-label="풀이 결과 필터">
        {([['all','전체'],['correct','정답'],['incorrect','오답']] as const).map(([value,label]) =>
         <button key={value} className={'chip '+(historyFilter===value?'active':'')} aria-pressed={historyFilter===value} onClick={()=>setHistoryFilter(value)}>{label}</button>)}
       </div>
       <label className="quiz-history-limit">최근 기록
        <select aria-label="풀이 기록 조회 개수" value={historyLimit} onChange={e=>setHistoryLimit(Number(e.target.value))}>
         {[5,10,20].map(limit=><option key={limit} value={limit}>{limit}개</option>)}
        </select>
       </label>
       <div className="quiz-attempt-list" aria-live="polite" aria-busy={history.loading}>
        <ResourceState {...history}/>
        {history.data?.length===0 && <p className="muted small">{historyFilter==='all'?'아직 풀이 기록이 없어요.':historyFilter==='correct'?'정답 기록이 없어요.':'오답 기록이 없어요.'}</p>}
        {history.data?.map((attempt,i)=>{
         const question=questions.find(q=>q.id===String(attempt.questionId))
         const option=question?.choices.find(c=>c.id===String(attempt.selectedOptionId))
         // Server LocalDateTime has no zone. Preserve its wall time without guessing a timezone.
         const time=attempt.submittedAt.replace('T',' ').slice(0,19)
         return <article className="quiz-attempt" key={i}>
          <div className="between"><strong>문항 {attempt.questionId}</strong><span className={'attempt-result '+(attempt.correct?'correct':'incorrect')}>{attempt.correct?'정답':'오답'}</span></div>
          {question && <p className="attempt-question">{question.text}</p>}
          <p className="small">선택 {attempt.selectedOptionId}{option?' · '+option.label:''}</p>
          <time dateTime={attempt.submittedAt}>{time}</time>
         </article>
        })}
       </div>
       <p className="muted small quiz-history-note">최근 {historyLimit}개 · 최신순<br/>시각은 서버 기록 기준입니다.</p>
       <button className="secondary-button small-button" disabled={history.loading||summary.loading} onClick={()=>{history.retry();summary.retry()}}>기록 새로고침</button>
      </aside>
     </main>
 )
}
