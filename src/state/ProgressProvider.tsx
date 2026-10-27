import { useEffect,useMemo,useRef,useState } from 'react'
import type { ReactNode } from 'react'
import { ProgressContext } from './ProgressContext'
import type { ProgressValue } from './ProgressContext'
import type { Progress } from '../types/mvp'
import { seoulDay } from '../data/choices'
function newProgress(demo:boolean):Progress {
 return {points:demo?1240:0,inventory:demo?['LG-home']:[],equipped:demo?{jersey:'LG-home'}:{},quizzes:{},seenTerms:[],seenTermsByDay:{},playback:{},reviewEnabled:true,categories:['기본 룰'],watchSeconds:{}}
}
function readProgress(key:string,demo:boolean):Progress {
 try {
  const value=JSON.parse(localStorage.getItem(key)||'null') as Progress|null
  if(value&&Number.isFinite(value.points)&&value.points>=0&&Array.isArray(value.inventory)&&value.quizzes&&value.playback) return {...newProgress(demo),...value}
 }catch{ /* Local records can be discarded if damaged. */ }
 return newProgress(demo)
}
export default function ProgressProvider({children,accountKey,demo}:{children:ReactNode;accountKey:string;demo:boolean}) {
 const storageKey='lookie.progress.v1.'+accountKey
 const [progress,setProgress]=useState(()=>readProgress(storageKey,demo))
 const [storageWarning,setStorageWarning]=useState(false)
 const cleared=useRef(false)
 useEffect(()=>{
  if(cleared.current)return
  try{localStorage.setItem(storageKey,JSON.stringify(progress))}
  catch{queueMicrotask(()=>setStorageWarning(true))}
 },[progress,storageKey])
 const actions = useMemo<Omit<ProgressValue,'progress'|'storageWarning'>>(() => ({
  savePlayback:(game,t)=>setProgress(p=>Math.abs((p.playback[game]||0)-t)<.5?p:{...p,playback:{...p.playback,[game]:t}}),
  markSeen:terms=>setProgress(p=>{
   const day=seoulDay(),before=p.seenTermsByDay[day]||[]
   const merged=[...new Set([...before,...terms])]
   return merged.length===before.length?p:{...p,seenTerms:[...new Set([...p.seenTerms,...terms])],seenTermsByDay:{...p.seenTermsByDay,[day]:merged}}
  }),
  addWatchSeconds:seconds=>setProgress(p=>{
   const day=seoulDay(),before=p.watchSeconds[day]||0,after=Math.min(10800,before+Math.max(0,Math.min(seconds,2)))
   return {...p,points:p.points+(demo?(Math.floor(after/1800)-Math.floor(before/1800))*10:0),watchSeconds:{...p.watchSeconds,[day]:after}}
  }),
  setReview:reviewEnabled=>setProgress(p=>({...p,reviewEnabled})),
  setCategories:categories=>setProgress(p=>({...p,categories})),
  applyConfirmedBalance:balance=>{if(Number.isFinite(balance)&&balance>=0)setProgress(p=>({...p,points:balance}))},
  awardDemoPoints:points=>{if(demo&&Number.isFinite(points)&&points>=0)setProgress(p=>({...p,points:p.points+points}))},
  clearLocalData:()=>{cleared.current=true;try{localStorage.removeItem(storageKey)}catch{/* Session still ends if storage is unavailable. */}},
  buy:(id,price,kind)=>setProgress(p=>p.inventory.includes(id)||p.points<price?p:{...p,points:p.points-price,inventory:[...p.inventory,id],equipped:{...p.equipped,[kind]:id}}),
  equip:(kind,id)=>setProgress(p=>p.inventory.includes(id)?{...p,equipped:{...p.equipped,[kind]:id}}:p),
  reset:()=>setProgress(newProgress(demo)),
 }),[demo,storageKey])
 return <ProgressContext.Provider value={{progress,storageWarning,...actions}}>{children}</ProgressContext.Provider>
}

