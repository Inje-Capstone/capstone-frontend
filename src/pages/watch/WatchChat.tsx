import { useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import RookieMascot from '../../components/RookieMascot'

export interface ChatMessage { role: 'user' | 'assistant'; text: string }

interface Props {
  messages: ChatMessage[]
  question: string
  busy: boolean
  onQuestionChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export function WatchChat({ messages, question, busy, onQuestionChange, onSubmit }: Props) {
  const logRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, busy])

  return (
    <section id="rookie-chat" className="rookie-card rookie-chat" aria-labelledby="rookie-chat-title">
      <header className="rookie-chat-heading"><RookieMascot /><h2 id="rookie-chat-title">루키 채팅</h2></header>
      <div ref={logRef} className="rookie-chat-log" role="log" aria-label="채팅 기록" aria-live="polite">
        {!messages.length && <p>경기를 보다가 궁금한 야구 용어가 나오면 물어봐 주세요.</p>}
        {messages.map((message, index) => <p key={index}
          className={message.role === 'user' ? 'rookie-user-message' : undefined}>
          <strong className="sr-only">{message.role === 'user' ? '나' : '루키'}: </strong>{message.text}
        </p>)}
        {busy && <p role="status">답변을 준비하고 있어요…</p>}
      </div>
      <form className="rookie-chat-form" data-form-hints="off" onSubmit={onSubmit}>
        <input aria-label="야구 질문" autoComplete="off" value={question} maxLength={500}
          onChange={event => onQuestionChange(event.target.value)} />
        <button type="submit" disabled={busy || !question.trim()}>전송 ↑</button>
      </form>
    </section>
  )
}
