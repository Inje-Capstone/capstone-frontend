import { apiRequest, requireResponseData } from './apiClient'
import { levels } from '../data/choices'
import type { Profile } from '../types/mvp'
export async function getProfile():Promise<Profile> {
  return requireResponseData(await apiRequest<Profile>('/api/users/me'))
}
export async function updateProfile(field:'nickname'|'supported-team'|'learning-level'|'game-notification', value:unknown):Promise<Profile> {
  const property = { nickname:'nickname','supported-team':'supportedTeam','learning-level':'learningLevel','game-notification':'gameNotificationEnabled' }[field]
  return requireResponseData(await apiRequest<Profile>(`/api/users/me/${field}`,{method:'PATCH',body:JSON.stringify({[property]:value})}))
}
export async function getTeams() {
  return requireResponseData(await apiRequest<{code:Profile['supportedTeam'];displayName:string}[]>('/api/users/supported-teams'))
}
export async function getLevels() {
  return requireResponseData(await apiRequest<typeof levels>('/api/users/learning-levels'))
}

