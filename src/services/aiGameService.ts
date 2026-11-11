import { aiRequest } from '../api/aiClient'
import type { Game, CardsOut, Card, Moment, Matchup, GameState, Term, TermSummary, ChatOut } from '../types/mvp'
import type { GameService } from './gameServiceContract'
import { recordingSource } from './recordingSource'

// Only real API calls and DTO-to-view-model mapping belong in this implementation.
// Errors propagate to the UI; no demo fallback is used.
export const aiGameService: GameService = {
 async listGames(signal) {
  const games = await aiRequest<Game[]>('/api/games', undefined, signal)
  return games.map(game => ({ ...game, playback: game.has_video ? recordingSource(game) : null }))
 },
 listTerms: signal => aiRequest<TermSummary[]>('/api/glossary', undefined, signal),
 getTerm: (id, level, signal) => aiRequest<Term>(`/api/glossary/${encodeURIComponent(id)}?level=${level || 'INTRODUCTORY'}`, undefined, signal),
 cards(game, t, level, signal, categories = []) {
  const query = new URLSearchParams({ t: String(Math.floor(t)), level: level || 'INTRODUCTORY' })
  categories.forEach(category => query.append('category', category))
  return aiRequest<CardsOut>(`/api/games/${encodeURIComponent(game)}/cards?${query}`, undefined, signal)
 },
 simplify: (game, card) => aiRequest<Card>(`/api/games/${encodeURIComponent(game)}/cards/${encodeURIComponent(card.id)}/simplify`, undefined, undefined, 'POST'),
 state: (game, t, signal) => aiRequest<GameState>(`/api/games/${encodeURIComponent(game)}/state?t=${Math.floor(t)}`, undefined, signal),
 moment: (game, t, level, signal) => aiRequest<Moment>(`/api/games/${encodeURIComponent(game)}/moment?t=${Math.floor(t)}&level=${level || 'INTRODUCTORY'}`, undefined, signal),
 matchup: (game, t, signal) => aiRequest<Matchup>(`/api/games/${encodeURIComponent(game)}/matchup?t=${Math.floor(t)}`, undefined, signal),
 chat: (game, t, question, level, categories = []) => aiRequest<ChatOut>(`/api/games/${encodeURIComponent(game)}/chat`, { question, t: Math.floor(t), level, categories }),
}
