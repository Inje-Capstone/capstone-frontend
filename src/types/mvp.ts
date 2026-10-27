import type { LearningLevel, OnboardingStatus, SupportedTeam } from './backend'
export interface Profile {
  userId: number; email: string | null; nickname: string
  learningLevel: LearningLevel | null; learningLevelDisplayName: string | null
  supportedTeam: SupportedTeam | null; supportedTeamDisplayName: string | null
  gameNotificationEnabled: boolean; onboardingCompleted: boolean
}
export interface Question { questionId: number; question: string; options: { optionId: number; text: string }[] }
export interface DiagnosisResult { correctCount: number; totalCount: number; learningLevel: LearningLevel }
export interface Game {
  id: string; date: string; stadium: string; away_team: string; home_team: string
  score_text: string | null; has_video: boolean; unavailable_reason: string | null; video_duration_sec: number
}
export interface Card {
  id: string; t: number; title: string; body: string; term_id: string; category: string
  rule_id: string; level: number; source: string; can_simplify: boolean; reasons: string[]
}
export interface CardsOut { game_id: string; t: number | null; level: number; cards: Card[]; degraded: boolean }
export interface Moment { event_id: string | null; t: number | null; text: string; source: string; scoreboard: string }
export interface Matchup {
  available: boolean; unavailable_reason?: string | null; batter?: string | null; batter_line?: string | null
  recent_form?: string | null; vs_pitcher?: string | null; team_form?: string | null; ai_note?: string | null; source?: string | null
}
export interface GameState {
  scoreboard: string; inning: number; half: string; balls: number; strikes: number; outs: number
  bases: boolean[]; runners_text: string; away_team: string; home_team: string; away_score: number
  home_score: number; batter: string | null; pitcher: string | null; game_over: boolean
}
export interface ChatOut { answer: string; ok: boolean; source: string; context: string; used_event_ids: string[] }
export interface TermSummary { id: string; name: string; category: string; category_label: string; aliases: string[]; summary: string }
export interface Term extends TermSummary { level: number; body: string; levels: Record<string,string>; related: TermSummary[] }
export interface QuizItem { id: string; term_id: string; question: string; choices: string[]; answer_index: number; explanation: string; source: string }
export interface QuizRecord { items: QuizItem[]; answers: Record<string, number> }
export interface Progress {
  points: number; inventory: string[]; equipped: Record<string,string>
  quizzes: Record<string,QuizRecord>; seenTerms: string[]; seenTermsByDay: Record<string,string[]>
  playback: Record<string,number>; reviewEnabled: boolean; categories: string[]
  watchSeconds: Record<string,number>
}
export interface DemoAccount { profile: Profile; onboarding: OnboardingStatus }

