import { ApiError } from './apiClient'
export async function aiRequest<T>(path:string,body?:unknown,signal?:AbortSignal,method?:'GET'|'POST'):Promise<T> {
 const base = import.meta.env.VITE_AI_BASE_URL || (import.meta.env.DEV ? '/ai-api' : '')
 if(!base) throw Error('AI 서비스 연결이 준비되지 않았어요. 시연 모드에서 화면을 확인할 수 있어요.')
 const timeout = AbortSignal.timeout(20000)
 const response = await fetch(base.replace(/\/$/,'')+path,{
  method:method||(body === undefined?'GET':'POST'),signal:signal?AbortSignal.any([signal,timeout]):timeout,
  headers:body === undefined?undefined:{'Content-Type':'application/json'},
  body:body === undefined?undefined:JSON.stringify(body),
 })
 const data = await response.json().catch(()=>null)
 if(!response.ok) throw new ApiError(response.status,data)
 if(data === null) throw Error('AI 응답이 비어 있어요.')
 return data as T
}

