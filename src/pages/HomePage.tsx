import { useCallback,useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listGames } from '../services/gameService'
import { useResource } from '../hooks/useResource'
import { useProgress } from '../state/ProgressContext'
import ResourceState from '../components/ResourceState'
import type { PlayableGame } from '../services/gameServiceContract'
export default function HomePage() {
 const {progress}=useProgress(),navigate=useNavigate()
 const games=useResource<PlayableGame[]>(useCallback((signal:AbortSignal)=>listGames(signal),[]))
 const [expanded,setExpanded]=useState(false)
 const featured=games.data?.find(g=>Boolean(g.playback))
 const canOpen=(game:PlayableGame)=>Boolean(game.playback)
 return <main className="page home-page">
  <ResourceState {...games}/>
  {featured&&<section className="featured-game"><div><p className="eyebrow">응원팀 추천 경기</p><h1>{featured.home_team} vs {featured.away_team} — {featured.date.slice(5).replace('-','/')} {featured.stadium}</h1></div><button disabled={!canOpen(featured)} onClick={()=>navigate('/watch/'+featured.id)}>{progress.playback[featured.id]>0?'이어보기':'경기 보기'}</button></section>}
  <h2 className="section-title">지난 경기 리플레이</h2>
  <div className="game-grid">{games.data?.slice(0,expanded?undefined:5).map(game=><button key={game.id} disabled={!canOpen(game)} onClick={()=>navigate('/watch/'+game.id)} className="game-card">
   <div className="between"><strong>{game.score_text||game.home_team+' vs '+game.away_team}</strong><span className="tag">{canOpen(game)?'영상 있음':'영상 미확보'}</span></div>
   <small>{game.date.slice(5).replace('-','/')} · {game.stadium}{!canOpen(game)?' · 선택 불가':''}</small>
  </button>)}{!expanded&&games.data&&games.data.length>5&&<button className="more-card" onClick={()=>setExpanded(true)}>더 보기</button>}</div>
  {games.data?.some(g=>g.has_video&&!canOpen(g))&&<p className="page-note">영상 제공 주소가 연결되지 않은 경기는 선택할 수 없어요.</p>}
 </main>
}
