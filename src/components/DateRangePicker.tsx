import { useEffect,useId,useRef,useState } from 'react'
import type { DateRange } from '../types/quiz'
import { addDays,rangeDays } from '../data/dateRange'
import { seoulDay } from '../data/choices'
import calendarIcon from '../assets/figma/calendar.png'
export default function DateRangePicker({value,onChange}:{value:DateRange;onChange:(range:DateRange)=>void}) {
 const [open,setOpen]=useState(false),[draft,setDraft]=useState(value),[anchor,setAnchor]=useState<string|null>(null),[error,setError]=useState('')
 const [month,setMonth]=useState(value.end.slice(0,7)),ref=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),id=useId()
 useEffect(()=>{if(!open)return
  const outside=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node))setOpen(false)}
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus()}}
  window.addEventListener('pointerdown',outside);window.addEventListener('keydown',escape)
  return ()=>{window.removeEventListener('pointerdown',outside);window.removeEventListener('keydown',escape)}
 },[open])
 function shift(n:number) { const d=new Date(month+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()+n);setMonth(d.toISOString().slice(0,7)) }
 function select(day:string) {
  setError('')
  if(!anchor){setAnchor(day);setDraft({start:day,end:day});return}
  const range={start:day<anchor?day:anchor,end:day<anchor?anchor:day}
  if(rangeDays(range)>7){setError('최대 7일의 기간을 선택해주세요.');return}
  setDraft(range);setAnchor(null)
 }
 const first=month+'-01',start=addDays(first,-new Date(first+'T00:00:00Z').getUTCDay()),today=seoulDay()
 return <div className="date-range-picker" ref={ref}>
  <button className="search-box date-range-trigger" ref={trigger} aria-label="퀴즈 날짜 기간 선택" aria-expanded={open} aria-controls={id} onClick={()=>{setDraft(value);setAnchor(null);setError('');setOpen(v=>!v)}}><span>{value.start.replaceAll('-','.')} – {value.end.replaceAll('-','.')}</span><img src={calendarIcon} width="28" height="28" alt=""/></button>
  {open&&<section className="range-calendar" id={id} aria-label="퀴즈 기간 달력"><header><button className="text-button" aria-label="이전 달" onClick={()=>shift(-1)}>‹</button><strong>{month.replace('-','년 ')}월</strong><button className="text-button" aria-label="다음 달" disabled={month>=today.slice(0,7)} onClick={()=>shift(1)}>›</button></header>
   <div className="calendar-grid">{['일','월','화','수','목','금','토'].map(label=><span className="calendar-weekday" key={label}>{label}</span>)}
   {Array.from({length:42},(_,i)=>addDays(start,i)).map(day=><button key={day} aria-label={day} aria-pressed={day>=draft.start&&day<=draft.end} disabled={day>today} className={(day.slice(0,7)!==month?'adjacent ':'')+(day>=draft.start&&day<=draft.end?'in-range ':'')+(day===draft.start||day===draft.end?'range-edge':'')} onClick={()=>select(day)}>{Number(day.slice(-2))}</button>)}</div>
   <p className="small" role="status">{error|| (anchor?'종료일을 선택해주세요 · 최대 7일':`${draft.start} ~ ${draft.end} (${rangeDays(draft)}일)`)}</p>
   <div className="row"><button className="text-button" onClick={()=>{setOpen(false);trigger.current?.focus()}}>취소</button><button disabled={!!anchor||!!error} onClick={()=>{onChange(draft);setOpen(false);trigger.current?.focus()}}>적용</button></div>
  </section>}
 </div>
}
