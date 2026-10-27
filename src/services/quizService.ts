import { demoQuizRepository } from '../demo/quizRepository'
import { isDemoSession } from '../demo/demoAccount'
import { backendPort } from '../integrations/backendPorts'
import type { QuizRepository } from '../types/quiz'
async function repository(): Promise<QuizRepository> {
 return isDemoSession() ? demoQuizRepository : backendPort('quiz')
}
export const quizService: QuizRepository = {
 history: async (...args) => (await repository()).history(...args),
 load: async (...args) => (await repository()).load(...args),
 submit: async (...args) => (await repository()).submit(...args),
}
