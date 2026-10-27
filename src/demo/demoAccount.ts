import type { DemoAccount } from '../types/mvp'
import type { OnboardingStatus } from '../types/backend'
const key = 'lookie.demo.account.v1'
let memory: DemoAccount | null = null
let memorySession = false
export function isDemoSession() { try { return sessionStorage.getItem('lookie.demo.active') === 'true' } catch { return memorySession } }
export function setDemoSession(active:boolean) { memorySession=active;try { if(active) sessionStorage.setItem('lookie.demo.active','true'); else sessionStorage.removeItem('lookie.demo.active') } catch { /* Memory-only session. */ } }
export function freshAccount(): DemoAccount {
  return { profile:{ userId:0,email:'rookie@example.com',nickname:'루키',learningLevel:null,learningLevelDisplayName:null,supportedTeam:null,supportedTeamDisplayName:null,gameNotificationEnabled:false,onboardingCompleted:false },
    onboarding:{requiredTermsAgreed:false,gameNotificationEnabled:false,diagnosisCompleted:false,learningLevel:null,diagnosisScore:null,supportedTeamSelected:false,supportedTeam:null,onboardingCompleted:false} }
}
export function clearDemoAccount() { memory=null;try{localStorage.removeItem(key)}catch{/* Memory-only browser. */}setDemoSession(false) }
export function readDemo(): DemoAccount {
  if(memory) return memory
  try {
    const raw = JSON.parse(localStorage.getItem(key) || 'null') as DemoAccount | null
    if(raw?.profile && raw?.onboarding && typeof raw.profile.nickname === 'string') { memory = raw; return raw }
  } catch { /* A damaged or unavailable store starts a clean demonstration. */ }
  return freshAccount()
}
export function saveDemo(account:DemoAccount) {
  memory = account
  try { localStorage.setItem(key,JSON.stringify(account)) } catch { /* Memory fallback. */ }
}
export function patchDemoOnboarding(patch:Partial<OnboardingStatus>) {
  const account = readDemo()
  const onboarding = {...account.onboarding,...patch}
  saveDemo({...account,onboarding,profile:{...account.profile,
    learningLevel:onboarding.learningLevel,supportedTeam:onboarding.supportedTeam,
    gameNotificationEnabled:onboarding.gameNotificationEnabled,onboardingCompleted:onboarding.onboardingCompleted}})
  return onboarding
}

