import { teams } from './choices'
import type { SupportedTeam } from '../types/backend'

export const officialStandings = 'https://www.koreabaseball.com/Record/TeamRank/TeamRank.aspx'
export const officialClubDirectory = 'https://www.koreabaseball.com/Kbo/League/TeamInfo.aspx'
export const officialTeamStats = 'https://www.koreabaseball.com/Record/Team/Hitter/Basic1.aspx'
export const standingsDate = '2026년 11월 8일'

type ClubCode = Exclude<SupportedTeam, 'NONE'>
type StandingsRow = readonly [ClubCode, number, number, number, string, number, string]

export const standings: readonly StandingsRow[] = [
  ['SAMSUNG', 83, 58, 3, '0.589', 8, '4승 6패'],
  ['KT', 90, 49, 5, '0.647', 0, '9승 1무'],
  ['KIA', 79, 63, 2, '0.556', 12.5, '7승 3패'],
  ['LG', 78, 65, 1, '0.545', 14, '3승 7패'],
  ['DOOSAN', 73, 66, 5, '0.525', 17, '6승 4패'],
  ['SSG', 65, 74, 5, '0.468', 25, '7승 3패'],
  ['LOTTE', 64, 77, 3, '0.454', 27, '4승 1무 5패'],
  ['NC', 64, 78, 2, '0.451', 27.5, '2승 8패'],
  ['HANWHA', 57, 83, 4, '0.407', 33.5, '3승 7패'],
  ['KIWOOM', 50, 90, 4, '0.357', 40.5, '5승 5패'],
]

const normalize = (name: string) => name.replace(/[\s._-]/g, '').toUpperCase()

export function teamForGameName(name: string) {
  const key = normalize(name)
  const aliases: Record<string, ClubCode> = { OB: 'DOOSAN', WO: 'KIWOOM', HT: 'KIA', LT: 'LOTTE', HH: 'HANWHA', SS: 'SAMSUNG', SK: 'SSG' }
  return teams.find(team => team.code !== 'NONE' &&
    (team.code === aliases[key] || [team.code, team.short, team.displayName].some(label => normalize(label) === key)))
}
