# 경기·AI 시연 데이터 전환 구조 — 2026-11-12

## 현재 구조

```text
HomePage / WatchPage / DictionaryPage
                │
      services/gameService.ts        ← 화면이 사용하는 고정 인터페이스
                │
       VITE_AI_DEMO_MODE
         ┌──────┴──────┐
       true          false
         │             │
 demo/gameService.ts  services/aiGameService.ts
         │             │
 demo/gameData.ts     api/aiClient.ts
 demo/glossarySeed.ts   │
                   실제 AI API
```

- `services/gameServiceContract.ts`가 양쪽 구현에 같은 메서드·인수·반환 타입을 요구합니다. 구현을 바꿔도 화면의 호출 방법을 유지합니다.
- 시연 서비스는 필요할 때 동적으로 불러옵니다. 실제 모드 빌드에서는 시연 모듈과 경기/용어 데이터가 산출물에서 제외됩니다.
- 실제 API 오류를 시연 데이터로 대체하지 않습니다. 현재 오류·재시도 화면으로 전달합니다.
- 화면은 특정 시연 경기 ID나 용어 ID를 직접 알지 않습니다. 사전 기본 선택은 서버/선택 서비스가 반환한 첫 용어를 사용합니다.
- 경기 서비스는 프론트 전용 `PlayableGame.playback`을 추가합니다. 이 값은 서버 DTO에 있다고 가정한 필드가 아닙니다. `recording`은 설정된 실제 영상 URL, `demo`는 시연용 타이머, null은 재생 불가를 뜻합니다.
- 실제 모드에서 영상이 없으면 시연용 타이머로 넘어가지 않습니다. 시연 데이터의 600초 길이와 준비된 장면은 demo 폴더 안에 있습니다.
- 현재 영상 URL/game_id 설정은 `services/recordingSource.ts`에서 해석합니다. 서버가 영상 주소를 제공하도록 계약이 확정되면 이 지점과 실제 어댑터를 변경합니다.

## 실제 AI로 전환할 때

1. 확정된 AI 주소·인증/중계 방식·URL/메서드·DTO와 `aiGameService.ts`를 대조합니다.
2. 서버 DTO가 화면 모델과 다르면 실제 어댑터에서 변환합니다. 화면 모델을 서버의 확정 규격이라고 가정하지 않습니다.
3. 실제 녹화 영상과 같은 game_id, 영상 시작점·시간 단위·오프셋을 확인합니다. 현재 API 인수는 영상 초 단위이며 정수 초로 내립니다.
4. 개발/배포 환경에서 `VITE_AI_DEMO_MODE=false`, `VITE_AI_BASE_URL`, `VITE_REPLAY_GAME_ID`, `VITE_REPLAY_VIDEO_URL`을 설정합니다. 설정은 빌드 시 반영되므로 재빌드/배포가 필요합니다.
5. GitHub CD는 Repository variable의 VITE_AI_DEMO_MODE를 사용하므로 그 값도 확인합니다. 이 작업에서는 배포 변수나 현재 운영 모드를 변경하지 않았습니다.
6. 9개 메서드의 성공/빈 값/오류/취소, 실제 영상과 설명·스코어보드의 시간 일치를 확인합니다.

`false` 설정은 실제 서버를 자동으로 준비하거나 인증을 해결하지 않습니다. AI 중계 API나 새 인증 정책이 확정되면 실제 어댑터/클라이언트에 반영해야 합니다. 명세가 미정인 API를 새로 만들지 않았습니다.

## 시연 데이터를 소스에서 완전히 제거할 때

실제 연결 검증을 마친 뒤:

1. 배포와 로컬 환경의 `VITE_AI_DEMO_MODE`를 false로 맞춥니다.
2. `src/services/gameService.ts`를 다음처럼 실제 구현 재노출로 단순화합니다.

```ts
import { aiGameService } from './aiGameService'

export const {
 listGames, listTerms, getTerm, cards, simplify,
 state, moment, matchup, chat,
} = aiGameService
```

3. `src/demo` 폴더의 시연 서비스·경기·용어 시드를 제거합니다. 이 폴더를 가져오는 제품 코드는 위 선택 지점 하나뿐입니다. 화면에서 시연 데이터를 찾아 지울 필요가 없습니다.
4. 빌드·린트·실제 모드 검증을 다시 수행합니다. 5174 테스트 도구는 저장소 밖의 별도 도구이므로 제품 시연 폴더 제거와 구분합니다. 삭제 후 테스트 도구에서도 AI 시연을 원한다면 별도의 응답 대체가 필요합니다.

시연 안내 문구를 완전히 없애고 싶다면 false로 고정된 화면 안내 조건도 후속 정리할 수 있습니다. 실제 기능을 쓰는 데 필요한 단계는 아닙니다.

## 검증한 범위

- TypeScript/Vite 및 ESLint.
- 시연 모드에서 기존 홈·사전·재생 타임라인·카드·챗봇·프로필·온보딩 등 브라우저 동작 유지.
- 대체 HTTP 응답으로 실제 모드의 9개 메서드, URL 인코딩, 초 단위, 난이도/카테고리 쿼리, POST 본문 유지 확인.
- 실제 모드의 503 오류가 그대로 표시되고 demo 모듈이 로드되지 않음 확인.
- AbortSignal 취소 유지, 실제 영상 설정 연결, 영상 미설정 시 재생 불가, 사전의 서버 첫 용어 선택 확인.
- true 빌드는 시연 데이터를 별도 JS로 포함하고 false 빌드는 시연 경기 ID·설명 시드가 모든 JS 산출물에서 빠지는 것을 확인.
- 실제 AI 서버와 녹화 영상의 종단 정합성은 검증하지 않았습니다.

## 다른 미완성 기능

이번 개선은 경기·AI 시연 데이터의 분리와 전환 구조에 한정합니다. 관심 카테고리·복습 설정·이어보기의 브라우저 저장, 상점·비밀번호·관리자·탈퇴 등은 기존 상태를 유지합니다.

다음 단계는 해당 기능의 서버 계약에 따라 조회·저장 서비스, 로딩/오류/재시도, 저장 성공 확인, 계정별 상태 동기화를 구현하는 것입니다. 서버 URL·DTO·권한·중복 처리 정책을 추측해 범용 어댑터를 만들지는 않았습니다.
