import { apiRequest, requireResponseData } from './apiClient'
import { isDemoSession, readDemo, saveDemo } from '../demo/demoAccount'
import { levels, teams } from '../data/choices'
import type { Profile } from '../types/mvp'
export async function getProfile():Promise<Profile> {
  if(isDemoSession()) return readDemo().profile
  return requireResponseData(await apiRequest<Profile>('/api/users/me'))
}
export async function updateProfile(field:'nickname'|'supported-team'|'learning-level'|'game-notification', value:unknown):Promise<Profile> {
  const property = { nickname:'nickname','supported-team':'supportedTeam','learning-level':'learningLevel','game-notification':'gameNotificationEnabled' }[field]
  if(isDemoSession()) {
    const account = readDemo()
    const profile = {...account.profile,[property]:value} as Profile
    profile.learningLevelDisplayName = levels.find(l=>l.code === profile.learningLevel)?.displayName || null
    profile.supportedTeamDisplayName = teams.find(t=>t.code === profile.supportedTeam)?.displayName || null
    saveDemo({...account,profile,onboarding:{...account.onboarding,learningLevel:profile.learningLevel,supportedTeam:profile.supportedTeam,gameNotificationEnabled:profile.gameNotificationEnabled}})
    return profile
  }
  return requireResponseData(await apiRequest<Profile>(`/api/users/me/${field}`,{method:'PATCH',body:JSON.stringify({[property]:value})}))
}
export async function getTeams() {
  if(isDemoSession()) return teams
  return requireResponseData(await apiRequest<{code:Profile['supportedTeam'];displayName:string}[]>('/api/users/supported-teams'))
}
export async function getLevels() {
  if(isDemoSession()) return levels
  return requireResponseData(await apiRequest<typeof levels>('/api/users/learning-levels'))
}

