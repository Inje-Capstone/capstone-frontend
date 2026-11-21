import { useRef, useState } from 'react'
import { getErrorMessage } from '../../api/apiClient'
import { quizService } from '../../services/quizService'
import type { QuizFeedback } from '../../services/quizService'
import type { QuizQuestion } from '../../types/quiz'

export function useQuizSession(onAnswerSaved: () => void) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, QuizFeedback>>({})
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)

  const item = questions[index]
  const result = item ? answers[item.id] : undefined
  const selected = result?.choiceId ?? choice
  const correctCount = Object.values(answers).filter(answer => answer.correct).length

  async function load() {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const loaded = await quizService.load()
      if (!loaded.length) {
        setError('현재 풀 수 있는 퀴즈가 없어요.')
        return
      }
      setQuestions(loaded)
      setAnswers({})
      setIndex(0)
      setChoice(null)
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  async function answer() {
    if (!item || choice === null || result || lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const feedback = await quizService.submit(item.id, choice)
      setAnswers(previous => ({ ...previous, [item.id]: feedback }))
      onAnswerSaved()
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  function moveTo(nextIndex: number) {
    setIndex(nextIndex)
    setChoice(null)
    setError('')
  }

  return {
    questions, item, result, selected, correctCount, index, choice, busy, error,
    setChoice, load, answer, moveTo,
  }
}
