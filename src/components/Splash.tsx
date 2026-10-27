import { useEffect,useState } from 'react'
import type { CSSProperties } from 'react'
function BaseballSeam() {
 // The curve stays in place; evenly spaced stitches travel down it.
 return <svg width="240" height="900" viewBox="0 0 240 900" fill="none" focusable="false">
  <path className="seam-line" d="M 40 0 Q 310 450 40 900"/>
  {Array.from({length:28},(_,i)=><g className="seam-stitch" key={i} style={{'--stitch-delay':`${-i*18/28}s`,'--stitch-position':`${i*100/28}%`} as CSSProperties}><path d="M -17 -9 L -3 6 M 17 -9 L 3 6"/></g>)}
 </svg>
}
export default function Splash({onContinue}:{onContinue?:()=>void}) {
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches)
 const [override,setOverride]=useState<boolean|null>(null)
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);media.addEventListener('change',update);return ()=>media.removeEventListener('change',update)},[])
 const moving=override??!reduced
 return <main className={'splash-screen '+(onContinue?'splash-welcome':'splash-loading')} aria-label="스플래시">
  {onContinue&&<><div className={'splash-decoration '+(moving?'seams-playing':'seams-paused')} aria-hidden="true">{['left','right'].map(side=><div className={'splash-seam '+side} key={side}><BaseballSeam/></div>)}</div>
   <div className="splash-motion-control">{reduced&&override===null&&!moving&&<span>동작 줄이기 설정으로 정지 중</span>}<button className="text-button" aria-pressed={moving} onClick={()=>setOverride(!moving)}>{moving?'실밥 애니메이션 정지':'실밥 애니메이션 재생'}</button></div></>}
  <div className="splash-content"><h1>LOOKIE</h1><p>야구, 오늘 처음 봐도 괜찮아요</p>
   {onContinue?<button className="splash-login" onClick={onContinue}>로그인</button>:<span className="sr-only" role="status">로그인 상태를 확인하고 있어요</span>}
  </div>
 </main>
}
