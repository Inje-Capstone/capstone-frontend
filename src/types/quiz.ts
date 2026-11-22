// Frontend view models, NOT an agreed backend wire format. Map confirmed DTOs in an adapter.
export interface DateRange { start: string; end: string }
export interface QuizAttempt {
 attemptId?: number
 questionId: number
 selectedOptionId: number
 correct: boolean
 submittedAt: string
}
export interface QuizAttemptDetail extends QuizAttempt {
 questionText: string
 options: { optionId: number; text: string }[]
 correctOptionId: number
 explanation: string | null
}
export interface QuizAttemptSummary {
 totalCount: number
 correctCount: number
 incorrectCount: number
 accuracyRate?: number
}
export interface QuizAttemptQuery { correct?: boolean; limit?: number }
export interface QuizResult { choiceId: string; correctChoiceId: string; correct: boolean; explanation: string; awardedPoints: number }
export interface QuizQuestion { id: string; text: string; termId?: string; choices: { id: string; label: string }[]; result?: QuizResult }
export interface DailyQuiz { id: string; date: string; questions: QuizQuestion[]; canSubmit: boolean }
export interface QuizHistory { date: string; answered: number; total: number }
export interface QuizSubmission { quizId: string; questionId: string; choiceId: string; submissionId: string }
export interface QuizReceipt { result: QuizResult; pointsBalance?: number }
export interface QuizRepository {
 history(range: DateRange, signal?: AbortSignal): Promise<QuizHistory[]>
 load(date: string, signal?: AbortSignal): Promise<DailyQuiz | null>
 submit(input: QuizSubmission): Promise<QuizReceipt>
}
