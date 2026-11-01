import { apiRequest, requireResponseData } from './apiClient'
import type { OnboardingStatus, SupportedTeam } from '../types/backend'
import type { Question, DiagnosisResult } from '../types/mvp'
const base = '/api/users/me/onboarding'
export async function agreeTerms(payload:{termsAgreed:boolean;privacyAgreed:boolean;gameNotificationEnabled:boolean}) {
 if(!payload.termsAgreed || !payload.privacyAgreed) throw Error('필수 약관에 동의해주세요.')
 return requireResponseData(await apiRequest<OnboardingStatus>(base+'/terms',{method:'PUT',body:JSON.stringify(payload)}))
}
export async function getQuestions():Promise<Question[]> {
 return requireResponseData(await apiRequest<Question[]>(base+'/diagnosis/questions'))
}
export async function submitDiagnosis(answers:{questionId:number;optionId:number}[]):Promise<DiagnosisResult> {
 return requireResponseData(await apiRequest<DiagnosisResult>(base+'/diagnosis',{method:'POST',body:JSON.stringify({answers})}))
}
export async function chooseTeam(supportedTeam:SupportedTeam) {
 return requireResponseData(await apiRequest<OnboardingStatus>(base+'/team',{method:'PUT',body:JSON.stringify({supportedTeam})}))
}
export async function completeOnboarding() {
 return requireResponseData(await apiRequest<OnboardingStatus>(base+'/complete',{method:'POST'}))
}

