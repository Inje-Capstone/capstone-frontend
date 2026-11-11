import { useState } from 'react'
import { teams } from '../data/choices'
import { teamEmblems } from '../data/teamAssets'
import type { SupportedTeam } from '../types/backend'

// Any future shop artwork or uploaded image can supply src; no character shape is assumed.
export interface ProfileImage { src: string; alt: string }
export default function ProfileAvatar({ team, image, large = false }: {
  team: SupportedTeam | null; image?: ProfileImage | null; large?: boolean
}) {
  const src = image?.src || (team ? teamEmblems[team] : undefined)
  const alt = image?.alt || `${teams.find(t => t.code === team)?.displayName || '기본'} 프로필`
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  return <span className={'avatar profile-avatar' + (large ? ' large' : '')}>
    {src && failedSrc !== src ? <img src={src} alt={alt} onError={() => setFailedSrc(src)} /> :
      <svg viewBox="0 0 32 32" role="img" aria-label="기본 프로필"><circle cx="16" cy="11" r="5"/><path d="M6 28a10 10 0 0 1 20 0"/></svg>}
  </span>
}
