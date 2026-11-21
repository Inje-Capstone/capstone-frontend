import type { RefObject } from 'react'
import { clock } from '../../data/choices'
import type { ResourceResult } from '../../hooks/useResource'
import type { GameState } from '../../types/mvp'

interface Props {
  source: string
  time: number
  duration: number
  videoError: string
  videoRef: RefObject<HTMLVideoElement | null>
  board: ResourceResult<GameState>
  onSeek: (time: number) => void
  onPlay: () => void
  onPause: () => void
  onEnd: () => void
  onError: () => void
  onMetadata: () => void
  onTimeUpdate: () => void
}

export function WatchPlayer({ source, time, duration, videoError, videoRef, board, onSeek, onPlay, onPause, onEnd, onError, onMetadata, onTimeUpdate }: Props) {
  return <>
    <video ref={videoRef} className="video-player" src={source} playsInline
      onLoadedMetadata={onMetadata} onTimeUpdate={onTimeUpdate} onPlay={onPlay} onPause={onPause} onEnded={onEnd} onError={onError} controls />
    {videoError && <p role="alert" className="login-error">{videoError}</p>}
    <label className="sr-only" htmlFor="video-timeline">재생 위치</label>
    <input id="video-timeline" type="range" min="0" max={duration} disabled={duration <= 0} step="1" value={time} onChange={event => onSeek(Number(event.target.value))} />
    <div className="playback-status">
      <span className="small">{clock(time)} / {clock(duration)}</span>
      <span className="scoreboard">{board.data?.scoreboard || '스코어보드 준비 중'}</span>
    </div>
  </>
}
