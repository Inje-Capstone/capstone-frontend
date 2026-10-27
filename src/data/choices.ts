import type { LearningLevel, SupportedTeam } from '../types/backend'
export const teams: { code: SupportedTeam; displayName: string; short: string }[] = [
  {code:'LG',displayName:'LG 트윈스',short:'LG'}, {code:'DOOSAN',displayName:'두산 베어스',short:'두산'},
  {code:'KIA',displayName:'KIA 타이거즈',short:'KIA'}, {code:'SAMSUNG',displayName:'삼성 라이온즈',short:'삼성'},
  {code:'LOTTE',displayName:'롯데 자이언츠',short:'롯데'}, {code:'SSG',displayName:'SSG 랜더스',short:'SSG'},
  {code:'HANWHA',displayName:'한화 이글스',short:'한화'}, {code:'NC',displayName:'NC 다이노스',short:'NC'},
  {code:'KT',displayName:'KT 위즈',short:'KT'}, {code:'KIWOOM',displayName:'키움 히어로즈',short:'키움'},
  {code:'NONE',displayName:'아직 없어요',short:'아직 없어요'},
]
export const levels: {code:LearningLevel;displayName:string}[] = [
  {code:'INTRODUCTORY',displayName:'입문'}, {code:'BEGINNER',displayName:'초보'}, {code:'FAMILIAR',displayName:'익숙'},
]
export const levelIndex = (level: LearningLevel | null) => level === 'FAMILIAR' ? 2 : level === 'BEGINNER' ? 1 : 0
export const categories = ['기본 룰','구종 · 투구','전술 · 기록','응원 문화']
export const categoryLabels: Record<string,string> = { basic_rules:'기본 룰', pitching:'구종 · 투구', tactics:'전술 · 기록', culture:'응원 문화' }
export function seoulDay() {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
}
export function clock(t:number) {
  const s = Math.max(0,Math.floor(t))
  return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map((n,i)=>i?String(n).padStart(2,'0'):String(n)).join(':')
}

