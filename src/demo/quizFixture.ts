import type { QuizItem } from '../types/mvp'
// UI demonstration only. Never used in a server-authenticated session.
export const demoQuiz:QuizItem[] = [
 {id:'daily-balk',term_id:'balk',question:'주자가 있을 때 투수가 투구 동작을 시작한 뒤 멈추면 어떤 판정을 받을 수 있나요?',choices:['볼 하나가 추가된다','보크 — 모든 주자가 한 베이스씩 간다','아무 일도 일어나지 않는다','타자가 1루로 걸어 나간다'],answer_index:1,explanation:'투수가 투구 동작을 시작한 뒤 멈추는 반칙은 보크가 될 수 있어요. 모든 주자가 한 베이스씩 진루해요.',source:'mock'},
 {id:'daily-strikeout',term_id:'strikeout_term',question:'타자가 세 번째 스트라이크를 받으면 보통 어떻게 되나요?',choices:['홈런','도루','삼진 아웃','볼넷'],answer_index:2,explanation:'스트라이크 세 개면 삼진이에요. 낫아웃처럼 예외가 있는 경우도 있어요.',source:'mock'},
 {id:'daily-walk',term_id:'walk',question:'볼넷을 얻으려면 볼이 몇 개 필요할까요?',choices:['2개','3개','4개','5개'],answer_index:2,explanation:'볼 네 개를 얻은 타자는 볼넷으로 1루에 나가요.',source:'mock'},
 {id:'daily-double',term_id:'double_play',question:'한 번의 플레이에서 아웃 두 개를 잡는 것을 무엇이라 할까요?',choices:['병살','홈런','견제','볼넷'],answer_index:0,explanation:'한 번의 연속된 수비 플레이에서 두 명을 아웃시키는 것이 병살이에요.',source:'mock'},
 {id:'daily-homerun',term_id:'homerun',question:'정상적인 홈런을 치면 누가 득점할까요?',choices:['타자만','3루 주자만','투수','타자와 베이스의 모든 주자'],answer_index:3,explanation:'타자와 베이스에 있던 주자들이 순서대로 홈을 밟아 득점해요.',source:'mock'},
]

