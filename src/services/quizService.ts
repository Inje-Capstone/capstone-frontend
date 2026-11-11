import { apiRequest, requireResponseData } from '../api/apiClient'
import type { QuizQuestion, QuizResult, QuizAttempt, QuizAttemptSummary, QuizAttemptQuery } from '../types/quiz'

interface QuizQuestionDto {
 questionId: number
 text: string
 options: { optionId: number; text: string }[]
}

interface QuizAnswerDto {
 questionId: number
 correct: boolean
}

export type QuizFeedback = Pick<QuizResult, 'choiceId' | 'correct'>

export const quizService = {
 async attempts(query: QuizAttemptQuery = {}, signal?: AbortSignal): Promise<QuizAttempt[]> {
  const limit = query.limit ?? 20
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error('풀이 기록은 1~20개까지 조회할 수 있어요.')
  const params = new URLSearchParams({ limit: String(limit) })
  if (query.correct !== undefined) params.set('correct', String(query.correct))
  const attempts = requireResponseData(await apiRequest<QuizAttempt[]>(`/api/quizzes/attempts?${params}`, { signal }))
  if (!Array.isArray(attempts) || attempts.some(item => !item || !Number.isInteger(item.questionId) || !Number.isInteger(item.selectedOptionId) || typeof item.correct !== 'boolean' || typeof item.submittedAt !== 'string')) {
   throw new Error('풀이 기록 응답을 확인하지 못했어요.')
  }
  return attempts
 },

 async summary(signal?: AbortSignal): Promise<QuizAttemptSummary> {
  const summary = requireResponseData(await apiRequest<QuizAttemptSummary>('/api/quizzes/attempts/summary', { signal }))
  if (![summary.totalCount, summary.correctCount, summary.incorrectCount].every(value => Number.isSafeInteger(value) && value >= 0)
   || summary.correctCount + summary.incorrectCount !== summary.totalCount) throw new Error('풀이 통계 응답을 확인하지 못했어요.')
  return summary
 },

 async load(): Promise<QuizQuestion[]> {
  const questions = requireResponseData(
      await apiRequest<QuizQuestionDto[]>('/api/quizzes/questions'),
  )

  if (!Array.isArray(questions)) {
   throw new Error('퀴즈 문제 응답을 확인하지 못했어요.')
  }

  return questions.map(question => ({
   id: String(question.questionId),
   text: question.text,
   choices: question.options.map(option => ({
    id: String(option.optionId),
    label: option.text,
   })),
  }))
 },

 async submit(questionId: string, choiceId: string): Promise<QuizFeedback> {
  const answer = requireResponseData(await apiRequest<QuizAnswerDto>(
      `/api/quizzes/questions/${encodeURIComponent(questionId)}/answers`,
      {
       method: 'POST',
       body: JSON.stringify({ optionId: Number(choiceId) }),
      },
  ))

  if (String(answer.questionId) !== questionId || typeof answer.correct !== 'boolean') {
   throw new Error('채점 응답을 확인하지 못했어요.')
  }

  return { choiceId, correct: answer.correct }
 },
}
