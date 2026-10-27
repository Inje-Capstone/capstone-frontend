import { apiRequest, requireResponseData } from './apiClient'
import { isDemoSession, patchDemoOnboarding } from '../demo/demoAccount'
import type { OnboardingStatus, SupportedTeam } from '../types/backend'
import type { Question, DiagnosisResult } from '../types/mvp'
const base = '/api/users/me/onboarding'
export const demoQuestions:Question[] = [
 {questionId:1,question:'한 팀이 한 이닝의 공격을 마치는 아웃 개수는?',options:[{optionId:1,text:'2개'},{optionId:2,text:'3개'},{optionId:3,text:'4개'}]},
 {questionId:2,question:'타자가 스트라이크 3개로 아웃되는 것을 무엇이라 할까요?',options:[{optionId:1,text:'볼넷'},{optionId:2,text:'홈런'},{optionId:3,text:'삼진'}]},
 {questionId:3,question:'타자가 볼 4개를 얻어 1루로 나가는 것을 무엇이라 할까요?',options:[{optionId:1,text:'볼넷'},{optionId:2,text:'삼진'},{optionId:3,text:'도루'}]},
]
export async function agreeTerms(payload:{termsAgreed:boolean;privacyAgreed:boolean;gameNotificationEnabled:boolean}) {
 if(!payload.termsAgreed || !payload.privacyAgreed) throw Error('필수 약관에 동의해주세요.')
 if(isDemoSession()) return patchDemoOnboarding({requiredTermsAgreed:true,gameNotificationEnabled:payload.gameNotificationEnabled})
 return requireResponseData(await apiRequest<OnboardingStatus>(base+'/terms',{method:'PUT',body:JSON.stringify(payload)}))
}
export async function getQuestions():Promise<Question[]> {
 if(isDemoSession()) return demoQuestions
 return requireResponseData(await apiRequest<Question[]>(base+'/diagnosis/questions'))
}
export async function submitDiagnosis(answers:{questionId:number;optionId:number}[]):Promise<DiagnosisResult> {
 if(isDemoSession()) {
  const correctCount = answers.filter(a=>a.optionId === [2,3,1][a.questionId-1]).length
  const learningLevel = correctCount === 3 ? 'FAMILIAR' : correctCount === 2 ? 'BEGINNER' : 'INTRODUCTORY'
  patchDemoOnboarding({diagnosisCompleted:true,diagnosisScore:correctCount,learningLevel})
  return {correctCount,totalCount:3,learningLevel}
 }
 return requireResponseData(await apiRequest<DiagnosisResult>(base+'/diagnosis',{method:'POST',body:JSON.stringify({answers})}))
}
export async function chooseTeam(supportedTeam:SupportedTeam) {
 if(isDemoSession()) return patchDemoOnboarding({supportedTeamSelected:true,supportedTeam})
 return requireResponseData(await apiRequest<OnboardingStatus>(base+'/team',{method:'PUT',body:JSON.stringify({supportedTeam})}))
}
export async function completeOnboarding() {
 if(isDemoSession()) return patchDemoOnboarding({onboardingCompleted:true})
 return requireResponseData(await apiRequest<OnboardingStatus>(base+'/complete',{method:'POST'}))
}

