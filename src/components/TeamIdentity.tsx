import { teamEmblems } from '../data/teamAssets'
import type { SupportedTeam } from '../types/backend'

export default function TeamIdentity({ team, name }: { team: SupportedTeam | null; name: string }) {
  const src = team ? teamEmblems[team] : undefined
  return <span className="team-identity">
    <span className="team-emblem">{src ? <img src={src} alt="" /> : <span aria-hidden="true">—</span>}</span>
    <span className="team-name">{name}</span>
  </span>
}
