import { useEffect, useState } from 'react'
import { getErrorMessage } from '../api/apiClient'
export function useResource<T>(load:(signal:AbortSignal)=>Promise<T>) {
 const [result,setResult] = useState<{data:T|null;error:string;loading:boolean}>({data:null,error:'',loading:true})
 const [version,setVersion] = useState(0)
 useEffect(()=>{
  const retry=()=>setVersion(n=>n+1)
  window.addEventListener('lookie:retry',retry)
  return ()=>window.removeEventListener('lookie:retry',retry)
 },[])
 useEffect(()=>{
  const controller = new AbortController()
  queueMicrotask(()=>{
   if(controller.signal.aborted) return
   setResult({data:null,error:'',loading:true})
   load(controller.signal).then(data=>{
    if(!controller.signal.aborted) setResult({data,error:'',loading:false})
   }).catch(error=>{if(!controller.signal.aborted) setResult({data:null,error:getErrorMessage(error),loading:false})})
  })
  return ()=>controller.abort()
 },[load,version])
 return {...result,retry:()=>setVersion(n=>n+1)}
}

