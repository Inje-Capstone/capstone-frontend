# 프론트엔드 실행 및 연동 안내

## 로컬 실행

```powershell
npm ci
npm run dev
```

개발 서버는 `.env.development.local`의 `DEV_API_PROXY_TARGET`로 Spring 백엔드에 연결합니다. 비공개 주소나 인증 정보를 저장소에 커밋하지 마세요.

## 서버 연결

- 로그인, 회원가입, OAuth, 온보딩, 내 정보, 퀴즈는 Spring API를 사용합니다.
- 경기, 용어, 장면 설명, 매치업, 챗봇은 Spring의 `/api/ai/**` 중계 API를 통해 AI 서버를 호출합니다. 로그인 JWT를 전달하며 AI 오류를 임의 데이터로 대체하지 않습니다.
- 실제 경기 영상은 AI 경기 목록과 맞는 영상 주소가 필요합니다. 현재 AI 경기 응답에는 영상 URL 필드가 없어 `VITE_REPLAY_GAME_ID`와 `VITE_REPLAY_VIDEO_URL`로 연결합니다. 주소가 없으면 재생을 막습니다.
- 퀴즈 풀이 기록은 서버에서 최신 10건을 조회합니다. 화면에서 5건 또는 10건을 표시합니다.

## 아직 서버 연결이 필요한 기능

- 상점 상품, 포인트 잔액, 구매 및 보유 아이템 API가 없어 실제 상품 목록을 표시하지 않습니다.
- 관심 카테고리, 복습 설정, 영상 이어보기와 학습 기록 일부는 현재 해당 기기의 브라우저에 저장됩니다.
- 퀴즈 풀이 상세 조회 API는 서버에 있으나 현재 화면에서 사용하지 않습니다.
- 비밀번호 재설정 경로는 현재 백엔드 OpenAPI에 공개되어 있지 않아 서버 규격 확인이 필요합니다.

## 주요 경로

`/login`, `/signup`, `/password-reset`, `/onboarding`, `/`, `/watch/:gameId`, `/dictionary`, `/quiz`, `/shop`, `/mypage`, `/offline`.

시연 경기·용어 seed와 임의 AI 응답은 제품 코드에서 제거했습니다. 실제 API 실패는 오류 상태로 표시합니다.
