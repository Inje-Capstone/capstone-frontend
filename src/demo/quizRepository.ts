import type { DailyQuiz, QuizRepository, QuizResult } from '../types/quiz'
import { seoulDay } from '../data/choices'
import { demoQuiz } from './quizFixture'
const key = 'lookie.demo.quizzes.v2'
type Store = Record<string, DailyQuiz>
let memory: Store | null = null
function read(): Store {
 if (memory) return memory
 try { memory = JSON.parse(localStorage.getItem(key) || '{}') as Store } catch { memory = {} }
 return memory!
}
function save(store: Store) { memory = store; localStorage.setItem(key, JSON.stringify(store)) }
export function clearDemoQuizzes() { memory = {}; try{localStorage.removeItem(key)}catch{/* Memory-only browser. */} }
export const demoQuizRepository: QuizRepository = {
 async history(range) { return Object.values(read()).filter(q => q.date >= range.start && q.date <= range.end).map(q => ({date:q.date,total:q.questions.length,answered:q.questions.filter(x=>x.result).length})) },
 async load(date) {
  const store = read()
  if (store[date]) return structuredClone({...store[date], canSubmit:date===seoulDay()})
  if (date !== seoulDay()) return null
  const quiz: DailyQuiz = {id:'demo:'+date,date,canSubmit:true,questions:demoQuiz.map(q=>({id:q.id,text:q.question,termId:q.term_id,choices:q.choices.map((label,i)=>({id:String(i),label}))}))}
  save({...store,[date]:quiz});return structuredClone(quiz)
 },
 async submit(input) {
  const store=structuredClone(read()), quiz=Object.values(store).find(q=>q.id===input.quizId),question=quiz?.questions.find(q=>q.id===input.questionId)
  if(!quiz || quiz.date!==seoulDay() || !question) throw Error('오늘의 시연 퀴즈만 풀 수 있어요.')
  if(question.result) return {result:question.result}
  const fixture=demoQuiz.find(q=>q.id===input.questionId)
  if(!fixture || !question.choices.some(c=>c.id===input.choiceId)) throw Error('보기를 다시 선택해주세요.')
  const correct=input.choiceId===String(fixture.answer_index)
  const result: QuizResult={choiceId:input.choiceId,correctChoiceId:String(fixture.answer_index),correct,explanation:fixture.explanation,awardedPoints:correct?20:0}
  question.result=result;save(store)
  return {result}
 }
}
