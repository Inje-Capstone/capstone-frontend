import type { Game } from '../types/mvp'
export const demoGame:Game = {id:'20260823LGOB',date:'2026-08-23',stadium:'잠실',away_team:'두산',home_team:'LG',score_text:'LG 5 : 3 두산',has_video:false,unavailable_reason:'시연용 타임라인 · 실제 영상 미확보',video_duration_sec:600}
export const demoGames:Game[] = [demoGame,
 {id:'ssg-kia',date:'2026-08-22',stadium:'문학',away_team:'SSG',home_team:'KIA',score_text:'SSG 2 : 7 KIA',has_video:false,unavailable_reason:'영상 미확보',video_duration_sec:0},
 {id:'samsung-lotte',date:'2026-08-22',stadium:'대구',away_team:'삼성',home_team:'롯데',score_text:'삼성 4 : 4 롯데',has_video:false,unavailable_reason:'영상 미확보',video_duration_sec:0},
 {id:'hanwha-nc',date:'2026-08-21',stadium:'대전',away_team:'한화',home_team:'NC',score_text:'한화 1 : 0 NC',has_video:false,unavailable_reason:'영상 미확보',video_duration_sec:0},
 {id:'kt-kiwoom',date:'2026-08-21',stadium:'수원',away_team:'KT',home_team:'키움',score_text:'KT 6 : 2 키움',has_video:false,unavailable_reason:'영상 미확보',video_duration_sec:0},
 {id:'lg-kia',date:'2026-08-20',stadium:'잠실',away_team:'KIA',home_team:'LG',score_text:null,has_video:false,unavailable_reason:'영상 미확보',video_duration_sec:0},
]
export const scenes = [
 {t:30,term:'strikeout_term',title:'스트라이크가 세 개면?',text:'타자가 세 번째 스트라이크를 받아 삼진 아웃됐어요.'},
 {t:90,term:'walk',title:'볼넷이 뭐예요?',text:'타자가 볼 네 개를 얻어 1루로 걸어 나가요.'},
 {t:180,term:'balk',title:'보크가 뭐예요?',text:'투수의 반칙 동작으로 주자가 한 베이스 진루했어요.'},
 {t:300,term:'double_play',title:'한 번에 아웃이 두 개?',text:'땅볼을 잡은 수비가 주자와 타자를 연속으로 아웃시켰어요.'},
 {t:420,term:'homerun',title:'홈런! 왜 점수가 나죠?',text:'타구가 담장을 넘어 타자와 모든 주자가 홈으로 들어와요.'},
]
