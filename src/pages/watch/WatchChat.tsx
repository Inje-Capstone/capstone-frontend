import type { FormEvent } from 'react'

export interface ChatMessage { role: 'user' | 'assistant'; text: string }

interface Props {
  messages: ChatMessage[]
  question: string
  busy: boolean
  onQuestionChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export function WatchChat({ messages, question, busy, onQuestionChange, onSubmit }: Props) {
  return (
    <div className="chat-box">
      <section className="chat-history" aria-label="AI 대화">
        <strong>AI 챗봇</strong>
        <div className="messages" role="log" aria-live="polite">
          {messages.map((message, index) => <p key={index} className={'chat-message ' + message.role}>
            <strong className="sr-only">{message.role === 'user' ? '나' : 'LOOKIE'}: </strong>{message.text}
          </p>)}
          {busy && <p role="status">답변을 준비하고 있어요…</p>}
        </div>
      </section>
      <form className="chat-input" data-form-hints="off" onSubmit={onSubmit}>
        <input aria-label="야구 질문" value={question} maxLength={500} onChange={event => onQuestionChange(event.target.value)} />
        <button disabled={busy || !question.trim()}>전송</button>
      </form>
    </div>
  )
}
