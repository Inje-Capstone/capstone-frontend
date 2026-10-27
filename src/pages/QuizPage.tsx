import { useCallback,useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useProgress } from '../state/ProgressContext'
import { quizService } from '../services/quizService'
import { seoulDay } from '../data/choices'
import { recentWeek } from '../data/dateRange'
import { getErrorMessage } from '../api/apiClient'
import { useResource } from '../hooks/useResource'
import type { DailyQuiz,QuizReceipt } from '../types/quiz'
import RewardStrip from '../components/RewardStrip'
import DateRangePicker from '../components/DateRangePicker'
import ResourceState from '../components/ResourceState'
export default function QuizPage() {
 const {demo}=useAuth(),{applyConfirmedBalance,awardDemoPoints}=useProgress()
 const today=seoulDay(),[range,setRange]=useState(recentWeek),[day,setDay]=useState(today)
 const [index,setIndex]=useState(0),[choice,setChoice]=useState<string|null>(null),[oldest,setOldest]=useState(false)
 const [record,setRecord]=useState<DailyQuiz|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const lock=useRef(false),submission=useRef<{key:string;id:string}|null>(null),applied=useRef(new Set<string>())
 const history=useResource(useCallback((signal:AbortSignal)=>quizService.history(range,signal),[range]))
 const item=record?.questions[index],result=item?.result
 const correct=record?.questions.filter(q=>q.result?.correct).length||0
 const earned=record?.questions.reduce((sum,q)=>sum+(q.result?.awardedPoints||0),0)||0
 const days=[...new Set([...history.data?.map(h=>h.date)||[],...(today>=range.start&&today<=range.end?[today]:[])])].sort((a,b)=>oldest?a.localeCompare(b):b.localeCompare(a))
 async function load(date:string) {
  if(lock.current)return;lock.current=true;setBusy(true);setError('');setRecord(null);setDay(date);setIndex(0);setChoice(null);submission.current=null
  try {const quiz=await quizService.load(date);setRecord(quiz);if(!quiz)setError('이 날짜에 저장된 퀴즈가 없어요.');history.retry()}catch(e){setError(getErrorMessage(e))}finally{lock.current=false;setBusy(false)}
 }
 async function answer() {
  if(!record||!item||choice===null||lock.current||item.result)return
  lock.current=true;setBusy(true);setError('')
  const key=record.id+':'+item.id+':'+choice
  if(submission.current?.key!==key)submission.current={key,id:crypto.randomUUID()}
  try {
   const receipt:QuizReceipt=await quizService.submit({quizId:record.id,questionId:item.id,choiceId:choice,submissionId:submission.current.id})
   if(!receipt?.result || receipt.result.choiceId!==choice || !item.choices.some(c=>c.id===receipt.result.correctChoiceId) || !Number.isFinite(receipt.result.awardedPoints))throw Error('채점 응답을 확인하지 못했어요. 다시 시도해주세요.')
   setRecord({...record,questions:record.questions.map(q=>q.id===item.id?{...q,result:receipt.result}:q)})
   if(receipt.pointsBalance!==undefined)applyConfirmedBalance(receipt.pointsBalance)
   else if(demo&&!applied.current.has(key)){awardDemoPoints(receipt.result.awardedPoints);applied.current.add(key)}
   history.retry()
  } catch(e){setError(getErrorMessage(e))}finally{lock.current=false;setBusy(false)}
 }
 return <><main className="page quiz-layout"><aside className="quiz-history">
  <DateRangePicker value={range} onChange={setRange}/>
  <button className="text-button sort-button" onClick={()=>setOldest(p=>!p)}>정렬 · {oldest?'오래된 순':'최신순'} ↕</button>
  <ResourceState {...history}/>
  <div className="history-list">{days.map(date=>{const h=history.data?.find(h=>h.date===date);return <button key={date} disabled={busy} className={'history-row '+(day===date?'selected':'')} onClick={()=>void load(date)}><strong>{date.slice(5).replace('-','/')}</strong><small>{h?`퀴즈 풀이 현황 (${h.answered}/${h.total})`:'오늘의 퀴즈 조회'}</small></button>})}</div>
  <p className="muted small">{demo?'시연 전용 문제와 기기 내 기록':'서버에 저장된 퀴즈와 풀이 기록'}</p>
 </aside><section className="quiz-question" aria-live="polite" aria-busy={busy}>
  {!record?<div className="quiz-intro"><p className="eyebrow">오늘 본 룰로 복습해요</p><h1>{day===today?'오늘의 퀴즈를 확인해보세요':'이 날짜의 퀴즈 기록을 확인해보세요'}</h1><p>문제 수와 보상은 조회된 퀴즈에 따라 표시돼요.</p><button disabled={busy} onClick={()=>void load(day)}>{busy?'문제를 불러오는 중…':'퀴즈 불러오기'}</button></div>:
  index>=record.questions.length?<div className="quiz-summary"><p className="eyebrow">복습 완료</p><h1>오늘도 야구와 한 걸음 가까워졌어요!</h1><strong className="diagnosis-score">{correct}<span> / {record.questions.length}</span></strong><p>획득한 포인트 {earned}P</p><div className="row"><Link className="button" to="/shop">상점 구경하기</Link><button className="secondary-button" onClick={()=>{setIndex(0);setChoice(null)}}>해설 다시 보기</button><Link to="/">홈으로</Link></div></div>:
  item&&<><p className="eyebrow">{index+1} / {record.questions.length}</p><h1>{item.text}</h1>
   <div className="answer-options">{item.choices.map((option,i)=><button key={option.id} disabled={busy||!!result||!record.canSubmit} className={'option '+((result?.choiceId??choice)===option.id?'selected':'')+(result?.correctChoiceId===option.id?' correct':'')} aria-pressed={(result?.choiceId??choice)===option.id} onClick={()=>setChoice(option.id)}>{i+1}. {option.label}</button>)}</div>
   {!result?<><button disabled={busy||choice===null||!record.canSubmit} onClick={()=>void answer()}>{busy?'채점 결과를 기다리고 있어요…':'정답 확인'}</button>{!record.canSubmit&&<p className="muted small">조회 전용 퀴즈예요.</p>}</>:
   <section className="quiz-feedback"><div><strong>{result.correct?'정답이에요!':'함께 알아봐요'} {result.awardedPoints>0?`+${result.awardedPoints}P`:''}</strong><p>{result.explanation}</p>{item.termId&&<Link to={'/dictionary?term='+encodeURIComponent(item.termId)}>용어 설명 보기 ↗</Link>}</div><button onClick={()=>{setIndex(i=>i+1);setChoice(null);submission.current=null}}>{index===record.questions.length-1?'결과 보기':'다음 문제'}</button></section>}
   {index>0&&<button className="text-button" disabled={busy} onClick={()=>{setIndex(i=>i-1);setChoice(null);submission.current=null}}>이전 문제</button>}
  </>}
  {error&&<p role="alert" className="login-error">{error}</p>}
 </section></main><RewardStrip/></>
}
