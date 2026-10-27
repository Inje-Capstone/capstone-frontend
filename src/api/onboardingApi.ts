import { apiRequest, requireResponseData } from './apiClient'
import type { OnboardingStatus } from '../types/backend'

export async function getOnboardingStatus(signal?: AbortSignal): Promise<OnboardingStatus> {
  const result = requireResponseData(await apiRequest<OnboardingStatus>(
    '/api/users/me/onboarding', { signal },
  ))
  if (['requiredTermsAgreed', 'gameNotificationEnabled', 'diagnosisCompleted',
    'supportedTeamSelected', 'onboardingCompleted'].some(
    key => typeof (result as unknown as Record<string, unknown>)[key] !== 'boolean',
  )) throw new Error('온보딩 상태 응답이 올바르지 않아요. 다시 시도해주세요.')
  return result
}

