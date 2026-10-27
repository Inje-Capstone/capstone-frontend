import { useCallback,useRef,useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getErrorMessage } from '../api/apiClient'
import { agreeTerms,getQuestions,submitDiagnosis,chooseTeam,completeOnboarding } from '../api/onboardingActions'
import { getTeams } from '../api/userApi'
import { shouldAskTeam } from '../config/onboardingPolicy'
import { levels } from '../data/choices'
import { useResource } from '../hooks/useResource'
import ResourceState from '../components/ResourceState'
import Modal from '../components/Modal'
import type { DiagnosisResult } from '../types/mvp'
import type { SupportedTeam } from '../types/backend'

export default function OnboardingPage() {
 const {state,demo,refreshSession,signOut}=useAuth()
 const initial=state.status==='authenticated'?state.onboarding:null
 const [status,setStatus]=useState(initial)
 const [step,setStep]=useState<'terms'|'diagnosis'|'result'|'team'>(()=>!initial?.requiredTermsAgreed?'terms':!initial.diagnosisCompleted?'diagnosis':'result')
 const [terms,setTerms]=useState({termsAgreed:initial?.requiredTermsAgreed||false,privacyAgreed:initial?.requiredTermsAgreed||false,gameNotificationEnabled:initial?.gameNotificationEnabled||false})
 const [termsDetail,setTermsDetail]=useState('')
 const [question,setQuestion]=useState(0),[answers,setAnswers]=useState<Record<number,number>>({})
 const [result,setResult]=useState<DiagnosisResult|null>(initial?.diagnosisCompleted?{correctCount:initial.diagnosisScore||0,totalCount:3,learningLevel:initial.learningLevel||'INTRODUCTORY'}:null)
 const [team,setTeam]=useState<SupportedTeam|null>(initial?.supportedTeam||null)
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),lock=useRef(false)
 const questions=useResource(useCallback(async()=>step==='diagnosis'?getQuestions():[],[step]))
 const teamOptions=useResource(useCallback(async()=>step==='team'?getTeams():[],[step]))
 if(!initial||!status)return null
 if(initial.onboardingCompleted)return <Navigate to="/" replace/>
 async function action(run:()=>Promise<void>) {
  if(lock.current)return;lock.current=true;setBusy(true);setError('')
  try{await run()}catch(e){setError(getErrorMessage(e))}finally{lock.current=false;setBusy(false)}
 }
 const current=questions.data?.[question]
 return <main className="onboarding-page">
  <header className="onboarding-top"><div className="row"><button className="text-button onboarding-back" aria-label="뒤로가기" disabled={busy} onClick={()=>{if(step==='diagnosis'){if(question)setQuestion(question-1);else setStep('terms')}else if(step==='team')setStep('result');else if(step==='result'){setQuestion(2);setStep('diagnosis')}else signOut()}}>‹ 뒤로</button><span className="wordmark">LOOKIE</span></div><span>{demo?'화면 시연 모드':'처음 만나는 야구'}</span><button className="text-button" onClick={signOut}>로그아웃</button></header>
  <ol className="wizard-progress">{['약관 동의','수준 진단','진단 결과','응원팀'].map((name,i)=><li key={name} className={i===['terms','diagnosis','result','team'].indexOf(step)?'current':''}>{i+1}. {name}</li>)}</ol>
  <section className="onboarding-card" aria-labelledby="onboarding-title">
   {step==='terms'&&<><p className="eyebrow">시작하기 전에</p><h1 id="onboarding-title">약관에 동의해주세요</h1>
    <div className="terms-box"><label className="checkbox-row"><input type="checkbox" checked={terms.termsAgreed&&terms.privacyAgreed&&terms.gameNotificationEnabled} onChange={e=>setTerms({termsAgreed:e.target.checked,privacyAgreed:e.target.checked,gameNotificationEnabled:e.target.checked})}/>전체 동의</label>
     {([['termsAgreed','[필수] 서비스 이용약관'],['privacyAgreed','[필수] 개인정보 수집·이용'],['gameNotificationEnabled','[선택] 새 경기 알림 받기']] as const).map(([key,label])=><div className="terms-row" key={key}><label className="checkbox-row"><input type="checkbox" checked={terms[key]} onChange={e=>setTerms({...terms,[key]:e.target.checked})}/>{label}</label>{key!=='gameNotificationEnabled'&&<button className="text-button" onClick={()=>setTermsDetail(label)}>보기</button>}</div>)}
    </div><p className="muted small">선택 항목에 동의하지 않아도 이용할 수 있어요.</p>
    <button disabled={!terms.termsAgreed||!terms.privacyAgreed||busy} onClick={()=>void action(async()=>{setStatus(await agreeTerms(terms));setStep('diagnosis')})}>다음</button></>}
   {step==='diagnosis'&&<><p className="eyebrow">수준 진단 · {question+1} / 3</p><h1 id="onboarding-title">야구를 얼마나 아세요?</h1>
    <ResourceState {...questions}/>
    {current&&<><h2 className="question-title">{current.question}</h2><div className="answer-options">{current.options.map(option=><button className={'option '+(answers[current.questionId]===option.optionId?'selected':'')} aria-pressed={answers[current.questionId]===option.optionId} key={option.optionId} onClick={()=>setAnswers({...answers,[current.questionId]:option.optionId})}>{option.text}</button>)}</div>
     <div className="row wizard-buttons">
      <button disabled={busy||answers[current.questionId]===undefined} onClick={()=>question<2?setQuestion(question+1):void action(async()=>{
       const response=await submitDiagnosis(questions.data!.map(q=>({questionId:q.questionId,optionId:answers[q.questionId]})))
       setResult(response);setStatus({...status,diagnosisCompleted:true,learningLevel:response.learningLevel,diagnosisScore:response.correctCount});setStep('result')
      })}>{question<2?'다음':'결과 보기'}</button></div></>}
   </>}
   {step==='result'&&result&&<><p className="eyebrow">수준 진단 결과</p><h1 id="onboarding-title">{levels.find(l=>l.code===result.learningLevel)?.displayName} 야구 팬이에요!</h1><div className="diagnosis-score">{result.correctCount}<span> / {result.totalCount}</span></div><p>지금 수준에 맞춰 야구를 설명해드릴게요.</p><p className="muted small">수준은 나중에 마이페이지에서 바꿀 수 있어요.</p><button disabled={busy} onClick={()=>{if(shouldAskTeam(result.learningLevel))setStep('team');else void action(async()=>{await chooseTeam('NONE');await completeOnboarding();await refreshSession()})}}>{shouldAskTeam(result.learningLevel)?'응원팀 선택하기':'시작하기 → 홈'}</button><button className="text-button" onClick={()=>{setQuestion(0);setStep('diagnosis')}}>다시 풀어보기</button></>}
   {step==='team'&&<><p className="eyebrow">마지막 단계</p><h1 id="onboarding-title">응원하는 팀이 있나요?</h1><ResourceState {...teamOptions}/>
    <div className="team-grid">{teamOptions.data?.filter(t=>t.code!=='NONE').map(t=><button key={t.code} className={'team-option '+(team===t.code?'selected':'')} aria-pressed={team===t.code} title={t.displayName} onClick={()=>setTeam(t.code)}>{t.displayName.split(' ')[0]}</button>)}</div>
    <button className={'option '+(team==='NONE'?'selected':'')} aria-pressed={team==='NONE'} onClick={()=>setTeam('NONE')}>아직 없어요</button>
    <div className="row wizard-buttons"><button disabled={!team||busy} onClick={()=>void action(async()=>{await chooseTeam(team!);await completeOnboarding();await refreshSession()})}>{busy?'저장 중…':'시작하기 → 홈'}</button></div></>}
   {error&&<p className="login-error" role="alert">{error}</p>}
  </section>
  {termsDetail&&<Modal title={termsDetail} onClose={()=>setTermsDetail('')}><p>정식 약관 본문은 아직 제공되지 않았습니다. 이 화면은 동의 흐름을 확인하기 위한 화면이며, 공개 서비스 전 확정된 약관으로 교체해야 합니다.</p><button onClick={()=>setTermsDetail('')}>확인</button></Modal>}
 </main>
}

