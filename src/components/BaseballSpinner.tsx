import { useState } from 'react'
export default function BaseballSpinner() {
 const [playing,setPlaying]=useState(true)
 return <div className="offline-motion">
  <svg className={'offline-baseball '+(playing?'':'paused')} viewBox="0 0 100 100" width="80" height="80" aria-hidden="true" focusable="false">
   <circle cx="50" cy="50" r="46" fill="#fff" stroke="#d7d7d7" strokeWidth="2"/>
   <g fill="none" stroke="#bd3540" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 19 17 Q 61 50 19 83 M 81 17 Q 39 50 81 83" stroke="#dea0a6" strokeWidth="1.5"/>
    <path d="m 19 23 8 1 1-8 m-3 18 8 0-1-8 m-2 18 8-1-3-8 m-4 19 8-3-4-7 m-7 18 8-4-5-6 m-10 17 8-5-6-5 m-12 15 8-6-7-4"/>
    <path d="m 81 23-8 1-1-8 m3 18-8 0 1-8 m2 18-8-1 3-8 m4 19-8-3 4-7 m7 18-8-4 5-6 m10 17-8-5 6-5 m12 15-8-6 7-4"/>
   </g>
  </svg>
  <button className="text-button motion-toggle" aria-pressed={playing} onClick={()=>setPlaying(p=>!p)}>{playing?'야구공 회전 정지':'야구공 회전 재생'}</button>
 </div>
}
