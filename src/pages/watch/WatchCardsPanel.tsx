import { Link } from 'react-router-dom'
import ResourceState from '../../components/ResourceState'
import type { ResourceResult } from '../../hooks/useResource'
import type { Card, CardsOut } from '../../types/mvp'

interface Props {
  cards: ResourceResult<CardsOut>
  detected: Card[]
  keyword: (card: Card) => string
  expandedCard: string
  simplified: Record<string, Card>
  simplifying: string
  error: string
  onExpand: (id: string) => void
  onSimplify: (card: Card) => void
}

export function WatchCardsPanel({ cards, detected, keyword, expandedCard, simplified, simplifying, error, onExpand, onSimplify }: Props) {
  return <section className="ai-card-panel">
    <h2>지금 나온 야구 용어</h2>
    <ResourceState {...cards} />
    {cards.data?.degraded && <p role="status">설명을 준비하지 못했어요. 잠시 후 다시 시도해주세요.</p>}
    {cards.data && !cards.data.cards.length && <p className="muted">설명할 장면을 기다리고 있어요.</p>}
    {cards.data?.cards.slice(0, 1).map(original => {
      const card = simplified[original.id] || original
      const expanded = expandedCard === original.id
      return <article className="explanation-card" key={original.id}>
        <button className="card-cta" aria-expanded={expanded} aria-controls="scene-explanation"
          onClick={() => onExpand(expanded ? '' : original.id)}>{keyword(card)} {expanded ? '−' : '＋'}</button>
        <div id="scene-explanation" hidden={!expanded}>
            <p>{card.body}</p>
            <div className="row card-actions">
              <button className="secondary-button small-button" disabled={!card.can_simplify || simplifying === card.id} onClick={() => onSimplify(card)}>
                {card.can_simplify ? '더 쉽게 설명해줘' : '가장 쉬운 설명이에요'}
              </button>
              <Link className="button secondary-button small-button" to={'/dictionary?term=' + encodeURIComponent(card.term_id)} state={{ watch: cards.data?.game_id }}>용어 보기 ↗</Link>
            </div>
            <details className="explanation-reasons"><summary>설명 근거</summary>{card.reasons.map((reason, index) => <p className="small muted" key={index}>{reason}</p>)}</details>
        </div>
      </article>
    })}
    {detected.length > 0 && <details className="card-history">
      <summary>이 영상에서 감지된 키워드 {detected.length}개</summary>
      <div className="chips">{detected.map(card => <span key={card.term_id} className="chip">{keyword(card)}</span>)}</div>
    </details>}
    {error && <p role="alert" className="login-error">{error}</p>}
  </section>
}
