import { useCallback,useEffect,useRef,useState } from 'react'
import type { FormEvent } from 'react'
import { Link,useNavigate,useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useProgress } from '../state/ProgressContext'
import { useResource } from '../hooks/useResource'
import * as service from '../services/gameService'
import { demoGame,scenes } from '../demo/gameData'
import { clock } from '../data/choices'
import { getErrorMessage } from '../api/apiClient'
import Modal from '../components/Modal'
import ResourceState from '../components/ResourceState'
import type { Card } from '../types/mvp'
export default function WatchPage() {
 const {gameId=''}=useParams(),{state:auth,demo}=useAuth(),{progress,savePlayback,markSeen,addWatchSeconds,setReview}=useProgress()
 const navigate=useNavigate()
 const [time,setTime]=useState(()=>progress.playback[gameId]||0),[playing,setPlaying]=useState(false),[rate,setRate]=useState(1)
 const [duration,setDuration]=useState(600),[localUrl,setLocalUrl]=useState(''),[videoError,setVideoError]=useState('')
 const [endModal,setEndModal]=useState(false),[simplified,setSimplified]=useState<Record<string,Card>>({}),[simplifying,setSimplifying]=useState('')
 const [expandedCard,setExpandedCard]=useState('')
 const [panelError,setPanelError]=useState(''),[chatOpen,setChatOpen]=useState(false),[question,setQuestion]=useState('')
 const [messages,setMessages]=useState<{role:'user'|'assistant';text:string}[]>([]),[chatBusy,setChatBusy]=useState(false)
 const video=useRef<HTMLVideoElement>(null),timeRef=useRef(time),chatLock=useRef(false)
 const level=auth.status==='authenticated'?auth.onboarding.learningLevel:null
 const games=useResource(useCallback((signal:AbortSignal)=>service.listGames(signal),[]))
 const glossary=useResource(useCallback((signal:AbortSignal)=>service.listTerms(signal),[]))
 const game=games.data?.find(g=>g.id===gameId)
 const bucket=Math.floor(time/5)*5
 const categoryKey=progress.categories.join('|')
 const cards=useResource(useCallback((signal:AbortSignal)=>service.cards(gameId,bucket,level,signal,categoryKey.split('|').filter(Boolean)),[gameId,bucket,level,categoryKey]))
 const moment=useResource(useCallback((signal:AbortSignal)=>service.moment(gameId,bucket,level,signal),[gameId,bucket,level]))
 const board=useResource(useCallback((signal:AbortSignal)=>service.state(gameId,bucket,signal),[gameId,bucket]))
 const matchupBucket=Math.floor(time/60)*60
 const matchup=useResource(useCallback((signal:AbortSignal)=>service.matchup(gameId,matchupBucket,signal),[gameId,matchupBucket]))
 const configured=gameId===import.meta.env.VITE_REPLAY_GAME_ID?import.meta.env.VITE_REPLAY_VIDEO_URL||'':''
 const source=localUrl||configured
 const allowed=demo?gameId===demoGame.id:Boolean(configured&&game?.has_video)
 useEffect(()=>()=>{if(localUrl)URL.revokeObjectURL(localUrl)},[localUrl])
 useEffect(()=>{if(game?.video_duration_sec)queueMicrotask(()=>setDuration(game.video_duration_sec))},[game])
 useEffect(()=>{
  if(cards.data?.cards.length)markSeen(cards.data.cards.slice(0,1).map(c=>c.term_id))
 },[cards.data,markSeen])
 useEffect(()=>{
  if(!playing)return
  let last=performance.now()
  const timer=window.setInterval(()=>{
   const now=performance.now(),elapsed=Math.min(2,(now-last)/1000);last=now
   if(document.visibilityState!=='visible')return
   if(!source){
    const next=Math.min(duration,timeRef.current+elapsed*rate)
    timeRef.current=next;setTime(next);savePlayback(gameId,next)
    if(next>=duration)setPlaying(false)
   }
   if(!source||(video.current&&!video.current.paused&&!video.current.seeking&&video.current.readyState>=3))addWatchSeconds(elapsed)
  },1000)
  return ()=>window.clearInterval(timer)
 },[playing,source,rate,duration,gameId,savePlayback,addWatchSeconds])
 function seek(next:number) {
  const t=Math.max(0,Math.min(duration,next));timeRef.current=t;setTime(t);savePlayback(gameId,t)
  if(video.current&&source)video.current.currentTime=t
 }
 function toggle() {
  if(source&&video.current){
   if(playing)video.current.pause()
   else video.current.play().catch(()=>setVideoError('영상을 재생하지 못했어요. 다른 파일을 선택하거나 연결을 확인해주세요.'))
  }else setPlaying(p=>!p)
 }
 function finish() {
  setPlaying(false);video.current?.pause();savePlayback(gameId,timeRef.current)
  if(progress.reviewEnabled)setEndModal(true);else navigate('/')
 }
 async function ask(event:FormEvent) {
  event.preventDefault();if(!question.trim()||chatLock.current)return
  const text=question.trim();setQuestion('');setChatOpen(true);setChatBusy(true);chatLock.current=true
  setMessages(m=>[...m,{role:'user',text}])
  try{const out=await service.chat(gameId,time,text,level,progress.categories);setMessages(m=>[...m,{role:'assistant',text:out.ok?out.answer:'답변을 준비하지 못했어요. 다시 질문해주세요.'}])}
  catch(e){setMessages(m=>[...m,{role:'assistant',text:getErrorMessage(e)}])}
  finally{chatLock.current=false;setChatBusy(false)}
 }
 if(games.loading||games.error)return <main className="page"><ResourceState {...games}/></main>
 if(!game||!allowed)return <main className="page empty-state"><h1>이 경기의 영상이 준비되지 않았어요</h1><Link className="button" to="/">경기 목록으로</Link></main>
 return <main className="watch-page">
  <form hidden id="end-watch" onSubmit={e=>{e.preventDefault();finish()}}/>
  <section className="watch-main" aria-label="경기 영상과 챗봇">
   {source?<video ref={video} className="video-player" src={source} playsInline
    onLoadedMetadata={()=>{if(video.current&&Number.isFinite(video.current.duration)&&video.current.duration>0){setDuration(video.current.duration);video.current.currentTime=Math.min(timeRef.current,video.current.duration);video.current.playbackRate=rate}}}
    onTimeUpdate={()=>{if(video.current){const t=video.current.currentTime;timeRef.current=t;setTime(t);savePlayback(gameId,t)}}}
    onPlay={()=>{setPlaying(true);setVideoError('')}} onPause={()=>setPlaying(false)} onEnded={finish} onError={()=>{setPlaying(false);setVideoError('영상 파일을 읽을 수 없어요. 파일 형식과 경로를 확인해주세요.')}} controls/>:
    <div className="video-placeholder"><small>녹화 경기 · 화면 시연</small><div><h1>{game.home_team} vs {game.away_team}</h1><p>실제 영상 미확보</p><p className="small">아래 재생·탐색으로 가상 장면과 설명을 확인해요.</p><button onClick={toggle} className="preview-play" aria-label={playing?'시연 일시정지':'시연 재생'}>{playing?'Ⅱ':'▶'}</button></div><span className="tag">시연 타임라인 {clock(time)}</span></div>}
   {videoError&&<p role="alert" className="login-error">{videoError}</p>}
   <label className="sr-only" htmlFor="video-timeline">재생 위치</label><input id="video-timeline" type="range" min="0" max={duration||600} step="1" value={time} onChange={e=>seek(Number(e.target.value))}/>
   <div className="playback-controls"><button className="secondary-button small-button" onClick={toggle}>{playing?'일시정지':'재생'}</button>
    <label><span className="sr-only">재생 속도</span><select aria-label="재생 속도" value={rate} onChange={e=>{const n=Number(e.target.value);setRate(n);if(video.current)video.current.playbackRate=n}}>{[.5,1,1.5,2].map(n=><option key={n} value={n}>{n}x</option>)}</select></label>
    <span className="small">{clock(time)} / {clock(duration)}</span><span className="scoreboard">{board.data?.scoreboard||'스코어보드 준비 중'}</span></div>
   {demo&&<div className="scene-jumps">{scenes.map(s=><button key={s.t} className="chip" onClick={()=>seek(s.t)}>{clock(s.t)} {s.title}</button>)}</div>}
   {demo&&<details className="local-video"><summary>내 녹화 영상 선택 (선택 사항)</summary><p className="muted small">선택한 영상은 가상 경기 설명과 자동으로 맞춰지지 않아요.</p><input type="file" accept="video/*" aria-label="녹화 영상 파일" onChange={e=>{const file=e.target.files?.[0];if(file){setPlaying(false);setLocalUrl(URL.createObjectURL(file));setVideoError('')}}}/></details>}
   <div className="chat-box">{chatOpen&&<section className="chat-history" aria-label="AI 대화"><div className="between"><strong>AI 챗봇 {demo&&<small className="muted">· 준비된 시연 응답</small>}</strong><button className="text-button" onClick={()=>setChatOpen(false)}>접기</button></div>
    <div className="messages" role="log" aria-live="polite">{messages.length?messages.map((m,i)=><p key={i} className={'chat-message '+m.role}><strong className="sr-only">{m.role==='user'?'나':'LOOKIE'}: </strong>{m.text}</p>):<p className="muted">궁금한 야구 용어나 방금 장면을 물어보세요.</p>}{chatBusy&&<p role="status">답변을 준비하고 있어요…</p>}</div></section>}
    <form className="chat-input" onSubmit={ask}><input aria-label="야구 질문" placeholder="야구, 뭐든 물어보세요 (AI 챗봇 — 현재 경기 맥락 반영)" value={question} maxLength={500} onFocus={()=>setChatOpen(true)} onChange={e=>setQuestion(e.target.value)}/><button disabled={chatBusy||!question.trim()}>전송</button></form></div>
  </section>
  <aside className="watch-aside">
   <section className="ai-card-panel"><span className="ai-panel-label">AI 설명 카드 (자동 감지)</span><ResourceState {...cards}/>
    {cards.data?.degraded&&<p role="status">설명을 준비하지 못했어요. 잠시 후 다시 시도해주세요.</p>}
    {cards.data&&!cards.data.cards.length&&<p className="muted">설명할 장면을 기다리고 있어요.</p>}
    {cards.data?.cards.slice(0,1).map(original=>{const card=simplified[original.id]||original;return <article className="explanation-card" key={original.id}><div className="between"><h2>{expandedCard===original.id?card.title:'감지된 키워드'}</h2><button className="text-button" onClick={()=>seek(card.t)}>{clock(card.t)}</button></div><div className="card-keywords"><span className="chip">{glossary.data?.find(term=>term.id===card.term_id)?.name||card.title}</span></div>{expandedCard!==original.id?<button className="card-cta" onClick={()=>setExpandedCard(original.id)}>이 장면 설명 보기 →</button>:<><p>{card.body}</p><div className="between"><button className="text-button" disabled={!card.can_simplify||simplifying===card.id} onClick={async()=>{
     setSimplifying(card.id);setPanelError('');try{const out=await service.simplify(gameId,card);setSimplified(p=>({...p,[original.id]:out}))}catch(e){setPanelError(getErrorMessage(e))}finally{setSimplifying('')}
    }}>{card.can_simplify?'더 쉽게 설명해줘':'가장 쉬운 설명이에요'}</button><Link to={'/dictionary?term='+encodeURIComponent(card.term_id)} state={{watch:gameId}}>용어 ↗</Link></div><details><summary>설명 근거</summary>{card.reasons.map((r,i)=><p className="small muted" key={i}>{r}</p>)}</details><button className="text-button" onClick={()=>setExpandedCard('')}>설명 접기</button></>}</article>})}
    {cards.data&&cards.data.cards.length>1&&<details className="card-history"><summary>이전 설명 {cards.data.cards.length-1}개</summary>{cards.data.cards.slice(1).map(card=><button key={card.id} className="text-button" onClick={()=>seek(card.t)}>{clock(card.t)} · {card.title}</button>)}</details>}
    {panelError&&<p role="alert" className="login-error">{panelError}</p>}
   </section>
   <details className="analysis-panel" open><summary>선수 · 매치업 분석 <small>타석 교체 시 갱신</small></summary><ResourceState {...matchup}/>
    {matchup.data?.available?<><dl>{[['타자',matchup.data.batter+' — '+matchup.data.batter_line],['최근 흐름',matchup.data.recent_form],['상대 전적',matchup.data.vs_pitcher],['팀 흐름',matchup.data.team_form]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'기록 없음'}</dd></div>)}</dl><p className="analysis-note">{matchup.data.ai_note||'추가 설명이 없어요.'}</p>{demo&&<small className="muted">가상 선수 기록</small>}</>:matchup.data&&<p>{matchup.data.unavailable_reason||'기록을 불러올 수 없어요.'}</p>}
   </details>
   <details className="analysis-panel" open><summary>실시간 분석 <small>녹화 영상의 현재 장면</small></summary><ResourceState {...moment}/>{moment.data&&<><p>{moment.data.text}</p><p className="analysis-note">{demo?'가상 장면의 시연 요약':moment.data.source==='template'?'경기 데이터 기반 요약':'AI 장면 요약'}</p></>}</details>
  </aside>
  {endModal&&<Modal title="시청을 마칠까요?" onClose={()=>setEndModal(false)}><div className="watch-end-message">오늘 본 룰을 퀴즈로 복습해볼까요?<br/>문제와 보상은 퀴즈 조회 후 확인할 수 있어요.</div><div className="between"><div className="row"><button onClick={()=>navigate('/')}>닫기</button><button className="secondary-button" onClick={()=>navigate('/quiz')}>퀴즈 풀기</button></div><button className="text-button" onClick={()=>{setReview(false);navigate('/')}}>다시 보지 않기</button></div></Modal>}
 </main>
}
