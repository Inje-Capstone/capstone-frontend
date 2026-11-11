import type { LearningLevel } from '../types/backend'
import type { Game, CardsOut, Card, Moment, Matchup, GameState, Term, TermSummary, ChatOut } from '../types/mvp'

// Frontend playback metadata, derived locally; these are not backend DTO fields.
export type PlaybackSource = { kind: 'recording'; url: string } | { kind: 'demo' }
export interface PlayableGame extends Game { playback: PlaybackSource | null }

export interface GameService {
 listGames(signal?: AbortSignal): Promise<PlayableGame[]>
 listTerms(signal?: AbortSignal): Promise<TermSummary[]>
 getTerm(id: string, level: LearningLevel | null, signal?: AbortSignal): Promise<Term>
 cards(game: string, t: number, level: LearningLevel | null, signal?: AbortSignal, categories?: string[]): Promise<CardsOut>
 simplify(game: string, card: Card): Promise<Card>
 state(game: string, t: number, signal?: AbortSignal): Promise<GameState>
 moment(game: string, t: number, level: LearningLevel | null, signal?: AbortSignal): Promise<Moment>
 matchup(game: string, t: number, signal?: AbortSignal): Promise<Matchup>
 chat(game: string, t: number, question: string, level: LearningLevel | null, categories?: string[]): Promise<ChatOut>
}
