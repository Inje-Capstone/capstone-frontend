export type LearningLevel = 'INTRODUCTORY' | 'BEGINNER' | 'FAMILIAR'
export type SupportedTeam =
  | 'LG' | 'HANWHA' | 'SSG' | 'SAMSUNG' | 'NC' | 'KT'
  | 'LOTTE' | 'KIA' | 'DOOSAN' | 'KIWOOM' | 'NONE'

export interface LoginRequest { email: string; password: string }
export interface LoginResponse { userId: number; accessToken: string }
export interface OnboardingStatus {
  requiredTermsAgreed: boolean
  gameNotificationEnabled: boolean
  diagnosisCompleted: boolean
  learningLevel: LearningLevel | null
  diagnosisScore: number | null
  supportedTeamSelected: boolean
  supportedTeam: SupportedTeam | null
  onboardingCompleted: boolean
}
export type OnboardingStep = 'terms' | 'diagnosis' | 'team' | 'complete'
export function getOnboardingStep(status: OnboardingStatus): OnboardingStep {
  if (!status.requiredTermsAgreed) return 'terms'
  if (!status.diagnosisCompleted) return 'diagnosis'
  if (!status.supportedTeamSelected) return 'team'
  return 'complete'
}

