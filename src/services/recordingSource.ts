import type { Game } from '../types/mvp'
import type { PlaybackSource } from './gameServiceContract'

// Current recording configuration is kept at the data boundary, outside page components.
// Replace this resolver when the confirmed API supplies media URLs.
export function recordingSource(game: Game): PlaybackSource | null {
 const url = import.meta.env.VITE_REPLAY_VIDEO_URL
 return url && game.id === import.meta.env.VITE_REPLAY_GAME_ID
  ? { kind: 'recording', url }
  : null
}
