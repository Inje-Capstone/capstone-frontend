import { useCallback,useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAiDemoMode } from '../config/aiMode'
import { listGames } from '../services/gameService'
import { useResource } from '../hooks/useResource'
import { useProgress } from '../state/ProgressContext'
import ResourceState from '../components/ResourceState'
import type { Game } from '../types/mvp'
export default function HomePage() {
 const demo=isAiDemoMode(),{progress}=useProgress(),navigate=useNavigate()
 const games=useResource(useCallback((signal:AbortSignal)=>listGames(signal),[]))
 const [expanded,setExpanded]=useState(false)
 const featured=games.data?.find(g=>demo?g.id==='20260823LGOB':g.has_video)
 const videoReady=(game:Game)=>game.has_video&&Boolean(import.meta.env.VITE_REPLAY_VIDEO_URL)&&game.id===import.meta.env.VITE_REPLAY_GAME_ID
 const canOpen=(game:Game)=>(demo&&game.id==='20260823LGOB')||videoReady(game)
 return <main className="page home-page">
  <ResourceState {...games}/>
  {featured&&<section className="featured-game"><div><p className="eyebrow">{demo?'응원팀 추천 경기 · 가상 경기':'응원팀 추천 경기'}</p><h1>{featured.home_team} vs {featured.away_team} — {featured.date.slice(5).replace('-','/')} {featured.stadium}</h1></div><button disabled={!canOpen(featured)} onClick={()=>navigate('/watch/'+featured.id)}>{progress.playback[featured.id]>0?'이어보기':demo?'타임라인 시연':'경기 보기'}</button></section>}
  <h2 className="section-title">지난 경기 리플레이</h2>
  <div className="game-grid">{games.data?.slice(0,expanded?undefined:5).map(game=><button key={game.id} disabled={!canOpen(game)} onClick={()=>navigate('/watch/'+game.id)} className="game-card">
   <div className="between"><strong>{game.score_text||game.home_team+' vs '+game.away_team}</strong><span className="tag">{demo&&game.id==='20260823LGOB'?'시연 가능':videoReady(game)?'영상 있음':'영상 미확보'}</span></div>
   <small>{game.date.slice(5).replace('-','/')} · {game.stadium}{!canOpen(game)?' · 선택 불가':''}</small>
  </button>)}{!expanded&&games.data&&games.data.length>5&&<button className="more-card" onClick={()=>setExpanded(true)}>더 보기</button>}</div>
  {demo&&<p className="page-note">시연 경기에는 실제 영상이 없습니다. 준비된 가상 장면으로 재생·타임코드·AI 설명 흐름을 확인할 수 있어요.</p>}
  {!demo&&games.data?.some(g=>g.has_video&&!videoReady(g))&&<p className="page-note">영상 제공 주소가 연결되지 않은 경기는 선택할 수 없어요.</p>}
 </main>
}
