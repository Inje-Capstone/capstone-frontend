import { useEffect,useMemo,useRef,useState } from 'react'
import type { ReactNode } from 'react'
import { ProgressContext } from './ProgressContext'
import type { ProgressValue } from './ProgressContext'
import type { Progress } from '../types/mvp'
import { seoulDay } from '../data/choices'
function newProgress():Progress {
 return {points:0,pointsBalanceConfirmed:false,inventory:[],equipped:{},seenTerms:[],seenTermsByDay:{},playback:{},reviewEnabled:true,categories:['기본 룰'],watchSeconds:{}}
}
function readProgress(key:string):Progress {
 try {
  const value=JSON.parse(localStorage.getItem(key)||'null') as Progress|null
  if(value&&Number.isFinite(value.points)&&value.points>=0&&Array.isArray(value.inventory)&&value.playback) {
   const clean={...newProgress(),...value}
   // Discard the retired local mock-quiz cache without touching playback/settings.
   delete (clean as Progress & {quizzes?:unknown}).quizzes
   return clean
  }
 }catch{ /* Local records can be discarded if damaged. */ }
 return newProgress()
}
export default function ProgressProvider({children,accountKey}:{children:ReactNode;accountKey:string}) {
 const storageKey='lookie.progress.v1.'+accountKey
 const [progress,setProgress]=useState(()=>readProgress(storageKey))
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
   return {...p,watchSeconds:{...p.watchSeconds,[day]:after}}
  }),
  setReview:reviewEnabled=>setProgress(p=>({...p,reviewEnabled})),
  setCategories:categories=>setProgress(p=>({...p,categories})),
  applyConfirmedBalance:balance=>{if(Number.isFinite(balance)&&balance>=0)setProgress(p=>({...p,points:balance,pointsBalanceConfirmed:true}))},
  clearLocalData:()=>{cleared.current=true;try{localStorage.removeItem(storageKey)}catch{/* Session still ends if storage is unavailable. */}},
 }),[storageKey])
 return <ProgressContext.Provider value={{progress,storageWarning,...actions}}>{children}</ProgressContext.Provider>
}

