import type { CSSProperties } from 'react'
function BaseballSeam() {
 // The curve stays in place; evenly spaced stitches travel down it.
 return <svg width="240" height="900" viewBox="0 0 240 900" preserveAspectRatio="none" fill="none" focusable="false">
  <path className="seam-line" d="M 40 0 Q 310 450 40 900"/>
  {Array.from({length:28},(_,i)=><g className="seam-stitch" key={i} style={{'--stitch-delay':`${-i*18/28}s`,'--stitch-position':`${i*100/28}%`} as CSSProperties}><path d="M -17 -9 L -3 6 M 17 -9 L 3 6"/></g>)}
 </svg>
}
export default function Splash({onContinue}:{onContinue?:()=>void}) {
 return <main className={'splash-screen '+(onContinue?'splash-welcome':'splash-loading')} aria-label="스플래시">
  {onContinue&&<div className="splash-decoration seams-playing" aria-hidden="true">{['left','right'].map(side=><div className={'splash-seam '+side} key={side}><BaseballSeam/></div>)}</div>}
  <div className="splash-content"><h1>LOOKIE</h1><p>야구, 오늘 처음 봐도 괜찮아요</p>
   {onContinue?<button className="splash-login" onClick={onContinue}>로그인</button>:<span className="sr-only" role="status">로그인 상태를 확인하고 있어요</span>}
  </div>
 </main>
}
