import { backendPort } from '../integrations/backendPorts'
import type { QuizRepository } from '../types/quiz'
export const quizService: QuizRepository = {
 history: async (...args) => backendPort('quiz').history(...args),
 load: async (...args) => backendPort('quiz').load(...args),
 submit: async (...args) => backendPort('quiz').submit(...args),
}
