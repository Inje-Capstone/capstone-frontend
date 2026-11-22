import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getErrorMessage } from '../api/apiClient'
import * as gameService from '../services/gameService'
import { useProgress } from '../state/ProgressContext'
import { clearReconnect, reconnectTime } from '../state/reconnect'
import type { Card } from '../types/mvp'
import Modal from '../components/Modal'
import ResourceState from '../components/ResourceState'
import { WatchAnalysisPanel } from './watch/WatchAnalysisPanel'
import { WatchCardsPanel } from './watch/WatchCardsPanel'
import { WatchChat } from './watch/WatchChat'
import type { ChatMessage } from './watch/WatchChat'
import { WatchPlayer } from './watch/WatchPlayer'
import { useWatchData } from './watch/useWatchData'

export default function WatchPage() {
  const { gameId = '' } = useParams()
  const { state: auth } = useAuth()
  const { progress, savePlayback, markSeen, addWatchSeconds, setReview } = useProgress()
  const navigate = useNavigate()
  const { hash } = useLocation()

  const [time, setTime] = useState(() => reconnectTime(gameId) ?? progress.playback[gameId] ?? 0)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [videoError, setVideoError] = useState('')
  const [endModal, setEndModal] = useState(false)
  const [simplified, setSimplified] = useState<Record<string, Card>>({})
  const [simplifying, setSimplifying] = useState('')
  const [detectedCards, setDetectedCards] = useState<Record<string, Card[]>>({})
  const [expandedCard, setExpandedCard] = useState('')
  const [panelError, setPanelError] = useState('')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatBusy, setChatBusy] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timeRef = useRef(time)
  const chatLock = useRef(false)

  const level = auth.status === 'authenticated' ? auth.onboarding.learningLevel : null
  const data = useWatchData(gameId, time, level, progress.categories)
  const { games, cards, moment, board, matchup, keyword } = data
  const game = games.data?.find(item => item.id === gameId)
  const source = game?.playback?.url || ''
  const detectedForGame = detectedCards[gameId] || []

  useEffect(() => {
    if (source && hash === '#rookie-chat') {
      document.getElementById('rookie-chat')?.scrollIntoView({ block: 'nearest' })
    }
  }, [source, hash])

  useEffect(() => {
    if (game?.video_duration_sec) queueMicrotask(() => setDuration(game.video_duration_sec))
  }, [game])

  useEffect(() => {
    const cardsForTime = cards.data?.cards
    if (!cardsForTime?.length) return
    markSeen(cardsForTime.slice(0, 1).map(card => card.term_id))
    setDetectedCards(previous => {
      const existing = previous[gameId] || []
      const known = new Set(existing.map(card => card.term_id))
      const additions = cardsForTime.filter(card => {
        if (known.has(card.term_id)) return false
        known.add(card.term_id)
        return true
      })
      return additions.length ? { ...previous, [gameId]: [...existing, ...additions] } : previous
    })
  }, [cards.data, gameId, markSeen])

  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      const elapsed = Math.min(2, (now - last) / 1000)
      last = now
      if (document.visibilityState !== 'visible') return
      const video = videoRef.current
      if (video && !video.paused && !video.seeking && video.readyState >= 3) addWatchSeconds(elapsed)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [playing, addWatchSeconds])

  function seek(next: number) {
    const nextTime = Math.max(0, Math.min(duration, next))
    timeRef.current = nextTime
    setTime(nextTime)
    savePlayback(gameId, nextTime)
    clearReconnect()
    if (videoRef.current && source) videoRef.current.currentTime = nextTime
  }

  function finish() {
    setPlaying(false)
    videoRef.current?.pause()
    savePlayback(gameId, timeRef.current)
    if (progress.reviewEnabled) setEndModal(true)
    else navigate('/')
  }

  async function ask(event: FormEvent) {
    event.preventDefault()
    if (!question.trim() || chatLock.current) return
    const prompt = question.trim()
    setQuestion('')
    setChatBusy(true)
    chatLock.current = true
    setMessages(previous => [...previous, { role: 'user', text: prompt }])
    try {
      const response = await gameService.chat(gameId, time, prompt, level, progress.categories)
      setMessages(previous => [...previous, {
        role: 'assistant',
        text: response.ok ? response.answer : '답변을 준비하지 못했어요. 다시 질문해주세요.',
      }])
    } catch (error) {
      setMessages(previous => [...previous, { role: 'assistant', text: getErrorMessage(error) }])
    } finally {
      chatLock.current = false
      setChatBusy(false)
    }
  }

  async function simplify(card: Card) {
    setSimplifying(card.id)
    setPanelError('')
    try {
      const response = await gameService.simplify(gameId, card)
      setSimplified(previous => ({ ...previous, [card.id]: response }))
    } catch (error) {
      setPanelError(getErrorMessage(error))
    } finally {
      setSimplifying('')
    }
  }

  if (games.loading || games.error) return <main className="page"><ResourceState {...games} /></main>
  if (!game || !game.playback) return <main className="page empty-state">
    <h1>{game?.unavailable_reason || '이 경기의 영상 주소가 연결되지 않았어요.'}</h1>
    <Link className="button" to="/">경기 목록으로</Link>
  </main>

  return <main className="watch-page rookie-watch">
    <header className="rookie-watch-heading rookie-section-heading">
      <div><h1>{game.home_team} vs {game.away_team}</h1><p>{game.date} · {game.stadium}</p></div>
      <button type="button" onClick={finish} className="secondary-button">시청 종료 ↗</button>
    </header>
    <section className="watch-main" aria-label="경기 영상과 챗봇">
      <WatchPlayer
        source={source} time={time} duration={duration} videoError={videoError} videoRef={videoRef} board={board}
        onSeek={seek}
        onMetadata={() => {
          const video = videoRef.current
          if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return
          setDuration(video.duration)
          video.currentTime = Math.min(timeRef.current, video.duration)
        }}
        onTimeUpdate={() => {
          const video = videoRef.current
          if (!video) return
          timeRef.current = video.currentTime
          setTime(video.currentTime)
          savePlayback(gameId, video.currentTime)
          clearReconnect()
        }}
        onPlay={() => { setPlaying(true); setVideoError('') }}
        onPause={() => setPlaying(false)}
        onEnd={finish}
        onError={() => { setPlaying(false); setVideoError('영상 파일을 읽을 수 없어요. 파일 형식과 경로를 확인해주세요.') }}
      />
      <WatchChat messages={messages} question={question} busy={chatBusy} onQuestionChange={setQuestion} onSubmit={ask} />
    </section>
    <aside className="watch-aside">
      <WatchCardsPanel cards={cards} detected={detectedForGame} keyword={keyword} expandedCard={expandedCard}
        simplified={simplified} simplifying={simplifying} error={panelError} onExpand={setExpandedCard} onSimplify={card => void simplify(card)} />
      <WatchAnalysisPanel matchup={matchup} moment={moment} />
    </aside>
    {endModal && <Modal title="시청을 마칠까요?" onClose={() => setEndModal(false)}>
      <div className="watch-end-message">오늘 본 룰을 퀴즈로 복습해볼까요?<br />문제와 보상은 퀴즈 조회 후 확인할 수 있어요.</div>
      <div className="between"><div className="row">
        <button onClick={() => navigate('/')}>닫기</button>
        <button className="secondary-button" onClick={() => navigate('/quiz')}>퀴즈 풀기</button>
      </div><button className="text-button" onClick={() => { setReview(false); navigate('/') }}>다시 보지 않기</button></div>
    </Modal>}
  </main>
}
