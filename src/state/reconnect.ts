import { getAccessToken } from '../auth/tokenStorage'
const KEY='lookie.reconnect.v1'
export function sessionOwner() {
 const token=getAccessToken()
 if(!token)return 'anonymous'
 try{return String(JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub||'anonymous')}catch{return 'anonymous'}
}
export function safeResumePath(path:unknown):path is string {
 return typeof path==='string' && /^\/(?:$|watch\/[^/?#]+(?:[?#].*)?$|dictionary(?:[?#].*)?$|quiz(?:[?#].*)?$|shop(?:[?#].*)?$|mypage(?:[?#].*)?$|onboarding$|login$|signup$|password-reset$)/.test(path) && !path.includes('\\')
}
export function rememberDisconnect(path:string) {
 if(!safeResumePath(path))return
 const video=document.querySelector('video')
 const slider=document.querySelector<HTMLInputElement>('#video-timeline')
 const time=video?.currentTime??(slider?Number(slider.value):null)
 try{sessionStorage.setItem(KEY,JSON.stringify({path,owner:sessionOwner(),time:time!==null&&Number.isFinite(time)?time:null}))}catch{/* Storage is optional. */}
}
export function reconnectDestination():string {
 try{const value=JSON.parse(sessionStorage.getItem(KEY)||'null');return value?.owner===sessionOwner()&&safeResumePath(value?.path)?value.path:'/'}catch{return '/'}
}
export function reconnectTime(gameId:string):number|null {
 try{const value=JSON.parse(sessionStorage.getItem(KEY)||'null');return value?.owner===sessionOwner()&&value?.path==='/watch/'+encodeURIComponent(gameId)&&Number.isFinite(value.time)&&value.time>=0?value.time:null}catch{return null}
}
export function clearReconnect(){try{sessionStorage.removeItem(KEY)}catch{/* Storage is optional. */}}
