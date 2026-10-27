import { apiRequest,requireResponseData } from './apiClient'
import type { LoginResponse } from '../types/backend'
export function oauthStartUrl(provider:'google'|'kakao') {
 const base=(import.meta.env.VITE_OAUTH_BASE_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/,'')
 return base+'/oauth2/authorization/'+provider
}
const pending=new Map<string,Promise<LoginResponse>>()
export function exchangeOAuthCode(code:string):Promise<LoginResponse> {
 const existing=pending.get(code);if(existing)return existing
 const request=apiRequest<LoginResponse>('/api/auth/oauth/exchange',{method:'POST',auth:false,body:JSON.stringify({code})}).then(requireResponseData).then(result=>{
  if(typeof result.accessToken!=='string'||!result.accessToken.trim()||typeof result.userId!=='number')throw Error('소셜 로그인 응답을 확인하지 못했어요.')
  return result
 })
 pending.set(code,request)
 // Share a single-use code exchange during StrictMode remounts, then release tokens from memory.
 void request.finally(()=>window.setTimeout(()=>pending.delete(code),10000)).catch(()=>{})
 return request
}
