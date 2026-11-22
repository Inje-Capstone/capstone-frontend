import type { PlayableGame } from '../services/gameServiceContract'
import type { SupportedTeam } from '../types/backend'
import { teamForGameName } from './kbo'

export function isFavoriteReplay(game: PlayableGame, favorite: SupportedTeam | null): boolean {
  return favorite !== null && (
    teamForGameName(game.home_team)?.code === favorite ||
    teamForGameName(game.away_team)?.code === favorite
  )
}

export function orderReplays(games: readonly PlayableGame[], favorite: SupportedTeam | null): PlayableGame[] {
  return [...games].sort((a, b) =>
    Number(isFavoriteReplay(b, favorite)) - Number(isFavoriteReplay(a, favorite)) ||
    b.date.localeCompare(a.date))
}

export function watchGamePath(game: PlayableGame): string {
  return '/watch/' + encodeURIComponent(game.id)
}
