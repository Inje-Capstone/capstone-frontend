import { demoGames, demoGame, scenes } from './gameData'
import { glossarySeed } from './glossarySeed'
import { categoryLabels, levelIndex } from '../data/choices'
import { recordingSource } from '../services/recordingSource'
import type { GameService } from '../services/gameServiceContract'
import type { Card, Term, TermSummary } from '../types/mvp'

function summary(id: string): TermSummary {
 const term = glossarySeed[id]
 return { id, name: term?.name || id, category: term?.category || 'basic_rules', category_label: categoryLabels[term?.category] || '기본 룰', aliases: term?.aliases || [], summary: term?.easy || '' }
}
function termAt(id: string, level: number): Term {
 const term = glossarySeed[id]
 if (!term) throw Error('찾는 용어가 없어요.')
 return { ...summary(id), level, body: [term.easy, term.standard, term.deep][level] || term.easy,
  levels: { '입문': term.easy, '초보': term.standard, '익숙': term.deep },
  related: (term.related || []).filter(id => glossarySeed[id]).slice(0, 5).map(summary) }
}

// All synthetic game/AI behavior is removable with this demo directory.
export const demoGameService: GameService = {
 async listGames() {
  return demoGames.map(game => ({ ...game, playback: game.id === demoGame.id ? recordingSource(game) || { kind: 'demo' as const } : null }))
 },
 async listTerms() { return Object.keys(glossarySeed).map(summary) },
 async getTerm(id, level) { return termAt(id, levelIndex(level)) },
 async cards(game, t, level) {
  const current = scenes.filter(s => s.t <= t).map(s => {
   const term = glossarySeed[s.term]
   return { id: s.term + '@L' + levelIndex(level), t: s.t, title: s.title, body: term ? [term.easy, term.standard, term.deep][levelIndex(level)] : s.text,
    term_id: s.term, category: term?.category || 'basic_rules', rule_id: s.term, level: levelIndex(level), source: 'mock', can_simplify: levelIndex(level) > 0,
    reasons: ['시연용 가상 경기의 준비된 장면이에요.'] } as Card
  }).reverse()
  return { game_id: game, t, level: levelIndex(level), cards: current, degraded: false }
 },
 async simplify(_game, card) {
  const level = Math.max(0, card.level - 1), term = glossarySeed[card.term_id]
  return { ...card, id: card.term_id + '@L' + level, level, can_simplify: level > 0, body: [term?.easy, term?.standard, term?.deep][level] || card.body }
 },
 async state(_game, t) {
  const inning = t < 300 ? 1 : 2, outs = t < 30 ? 0 : t < 300 ? 1 : 2
  return { scoreboard: `두산 3 : ${t >= 420 ? 5 : 3} LG · ${inning}회말 · B2 S1 O${outs}`, inning, half: 'bot', balls: 2, strikes: 1, outs, bases: [true, false, false], runners_text: '주자 1루', away_team: '두산', home_team: 'LG', away_score: 3, home_score: t >= 420 ? 5 : 3, batter: '시연 타자', pitcher: '시연 투수', game_over: t >= 600 }
 },
 async moment(game, t) {
  const scene = scenes.filter(s => s.t <= t).at(-1)
  return { event_id: scene?.term || null, t: scene?.t || null, text: scene?.text || '곧 첫 타석이 시작돼요.', source: 'mock', scoreboard: (await demoGameService.state(game, t)).scoreboard }
 },
 async matchup(_game, t) {
  return { available: true, batter: t < 300 ? '시연 타자 A' : '시연 타자 B', batter_line: '시즌 타율 0.312', recent_form: '5경기 연속 출루', vs_pitcher: '4타수 2안타', team_form: 'LG 최근 10경기 0.600', ai_note: '주자가 있는 상황에서 장타를 기대해볼 수 있어요.', source: 'fixture' }
 },
 async chat(_game, t, question) {
  const found = Object.entries(glossarySeed).find(([, v]) => question.includes(v.name))
  const scene = scenes.filter(s => s.t <= t).at(-1)
  const answer = found ? found[1].easy : scene ? `방금은 ${scene.text} ${glossarySeed[scene.term]?.easy || ''}` : '궁금한 용어를 물어보세요. 보크, 볼넷, 삼진 같은 말을 설명해드릴게요.'
  return { answer, ok: true, source: 'mock', context: '준비된 용어 설명을 사용하는 시연 응답', used_event_ids: scene ? [scene.term] : [] }
 },
}
