import type { LearningLevel } from '../types/backend'
export type TeamQuestionPolicy = 'all' | 'introductory-only'
export const teamQuestionPolicy: TeamQuestionPolicy = import.meta.env.VITE_TEAM_QUESTION_POLICY === 'introductory-only' ? 'introductory-only' : 'all'
export function shouldAskTeam(level: LearningLevel, policy: TeamQuestionPolicy = teamQuestionPolicy) {
 return policy === 'all' || level === 'INTRODUCTORY'
}
