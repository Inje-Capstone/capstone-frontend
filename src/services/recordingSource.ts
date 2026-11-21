import type { Game } from '../types/mvp'
import type { PlaybackSource } from './gameServiceContract'

// Current recording configuration is kept at the data boundary, outside page components.
// The current game API does not include a media URL. Keep this mapping at the
// service boundary until that field is added to the confirmed server contract.
export function recordingSource(game: Game): PlaybackSource | null {
 const url = import.meta.env.VITE_REPLAY_VIDEO_URL
 return url && game.id === import.meta.env.VITE_REPLAY_GAME_ID
  ? { url }
  : null
}
