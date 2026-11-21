# AI API 연동 상태 — 2026-11-21

## 현재 호출 구조

화면은 `services/gameService.ts`를 사용하고, 이 모듈은 실제 API 구현인 `services/aiGameService.ts`를 바로 내보냅니다. 각 요청은 `api/aiClient.ts`에서 Spring의 `/api/ai/**`로 전달되며 공통 API 클라이언트가 로그인 JWT를 붙입니다. Spring은 허용된 경기·용어·규칙 경로를 AI 서버로 중계합니다.

연결 경로는 `/api/ai/api/games`, `/api/ai/api/games/{game_id}/cards`, `state`, `moment`, `matchup`, `chat`, 카드 `simplify`, `/api/ai/api/glossary`입니다. UI와 API 응답을 잇는 DTO 변환은 `aiGameService.ts`에 둡니다.

## 제거한 시연 코드

- `src/demo`의 가상 경기, 타임라인, 가상 분석 응답, 용어 seed
- `VITE_AI_DEMO_MODE` 선택 로직과 화면별 시연 안내
- 영상이 없어도 재생되는 가상 타이머
- AI 서버를 직접 호출하던 `/ai-api` Vite 프록시 및 `VITE_AI_BASE_URL` 설정

이제 실제 요청이 실패하면 기존 오류/재시도 UI에 오류를 전달합니다. 임의 응답으로 대체하지 않습니다.

## 영상 연결에 필요한 사항

현재 AI의 `GameOut` 응답에는 `video_url`이 없습니다. 프론트는 `services/recordingSource.ts`에서 `VITE_REPLAY_GAME_ID`와 `VITE_REPLAY_VIDEO_URL`을 비교해 영상이 설정된 경기만 재생하도록 합니다. 같은 경기의 실제 영상 주소를 제공하거나 서버 DTO에 영상 URL을 추가하면 이 파일의 경계에서 연결할 수 있습니다. 임의 경기 ID나 주소를 코드에 넣지 않습니다.

AI API는 영상 기준 초 단위 타임코드를 받습니다. 실제 영상과 AI 분석이 같은 경기·시작점인지 연결 후 확인해야 합니다.

## 별도 연동 과제

- 상점 상품·잔액·구매·보유 아이템은 서버 API가 없어 상점 목록을 비워 두었습니다.
- 관심 카테고리·복습 설정·이어보기 일부는 브라우저 저장이며 계정 간 서버 동기화는 없습니다.
- 퀴즈 풀이 상세 API는 백엔드 명세에 있으나 화면에서 아직 호출하지 않습니다.
- 비밀번호 재설정 API는 현재 백엔드 OpenAPI에서 확인되지 않아 경로와 DTO 확인이 필요합니다.
