import { useCallback } from 'react'
import { useResource } from '../../hooks/useResource'
import * as gameService from '../../services/gameService'
import type { Card } from '../../types/mvp'
import type { LearningLevel } from '../../types/backend'
import type { PlayableGame } from '../../services/gameServiceContract'
import type { CardsOut, GameState, Matchup, Moment, TermSummary } from '../../types/mvp'

export function useWatchData(gameId: string, time: number, level: LearningLevel | null, categories: string[]) {
  const categoryKey = categories.join('|')
  const games = useResource<PlayableGame[]>(useCallback(signal => gameService.listGames(signal), []))
  const glossary = useResource<TermSummary[]>(useCallback(signal => gameService.listTerms(signal), []))
  const bucket = Math.floor(time / 5) * 5
  const cards = useResource<CardsOut>(useCallback(signal => gameService.cards(gameId, bucket, level, signal, categoryKey.split('|').filter(Boolean)), [gameId, bucket, level, categoryKey]))
  const moment = useResource<Moment>(useCallback(signal => gameService.moment(gameId, bucket, level, signal), [gameId, bucket, level]))
  const board = useResource<GameState>(useCallback(signal => gameService.state(gameId, bucket, signal), [gameId, bucket]))
  const matchupBucket = Math.floor(time / 60) * 60
  const matchup = useResource<Matchup>(useCallback(signal => gameService.matchup(gameId, matchupBucket, signal), [gameId, matchupBucket]))
  const keyword = useCallback((card: Card) => glossary.data?.find(term => term.id === card.term_id)?.name || card.term_id, [glossary.data])

  return { games, glossary, cards, moment, board, matchup, keyword }
}
