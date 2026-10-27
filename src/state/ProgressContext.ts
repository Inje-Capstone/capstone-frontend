import { createContext,useContext } from 'react'
import type { Progress } from '../types/mvp'
export interface ProgressValue {
 progress:Progress; storageWarning:boolean
 savePlayback:(game:string,t:number)=>void; markSeen:(terms:string[])=>void
 addWatchSeconds:(seconds:number)=>void; setReview:(enabled:boolean)=>void; setCategories:(categories:string[])=>void
 applyConfirmedBalance:(balance:number)=>void; awardDemoPoints:(points:number)=>void; clearLocalData:()=>void
 buy:(id:string,price:number,kind:string)=>void; equip:(kind:string,id:string)=>void; reset:()=>void
}
export const ProgressContext=createContext<ProgressValue|null>(null)
export function useProgress() {
 const value=useContext(ProgressContext)
 if(!value) throw Error('ProgressProvider가 필요합니다.')
 return value
}

