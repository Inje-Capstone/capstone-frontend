import { apiRequest, requireResponseData } from '../api/apiClient'
import type { QuizQuestion, QuizResult } from '../types/quiz'

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