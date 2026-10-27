# LOOKIE 프론트엔드 MVP 사용 안내
## 시작
`E:\frontDev\capstone-frontend`에서 `npm run dev`를 실행하고 터미널에 표시된 주소를 연다.
현재 개발 서버 기본 주소는 http://127.0.0.1:5173/login 이다.

로그인 화면의 **서버 없이 화면 시연 시작**을 누르면 실제 서버 없이 모든 주요 화면을 사용할 수 있다.
회원가입부터 보려면 **시연용 회원가입부터 시작**을 선택한다.

## 권장 확인 순서
1. 시연용 회원가입: 이메일·비밀번호 확인·닉네임 검증. 비밀번호는 저장하지 않는다.
2. 약관 동의: 필수 2개, 선택 알림 1개. 정식 약관 본문은 아직 제공되지 않았다.
3. 수준 진단: 3문항 → 결과 → 10개 구단 또는 '아직 없어요' → 홈.
4. 홈의 타임라인 시연: 재생·일시정지·배속·장면 이동.
5. 자동 설명, 더 쉬운 설명, 설명 근거, 용어 링크, 선수 분석, 장면 요약, 챗봇.
6. 시청 종료 → 퀴즈 5문항 → 해설·결과 → 상점 구매·착용.
7. 용어 검색·카테고리·난이도, 날짜별 퀴즈 기록.
8. 마이페이지: 닉네임·수준·응원팀·관심사·알림·복습 설정.
9. 새로고침과 로그아웃 후 시연 재진입으로 기록 유지 확인.

## 상태와 포인트
- 시연 모드는 가상 경기와 준비된 응답을 사용하며 JWT를 만들거나 서버를 호출하지 않는다.
- 시연 계정: localStorage의 `lookie.demo.account.v1`.
- 시연 기록: `lookie.progress.v1.demo`. 실제 계정의 기기 내 기록과 분리된다.
- 세션 선택은 sessionStorage의 `lookie.demo.active`로 탭 단위 유지된다.
- 초기 1,240P와 LG 홈 유니폼은 Figma 화면 확인용 시연 상태다.
- 일일 퀴즈 최대 5문항, 정답마다 20P, 이미 채점한 문항 재조회로 보상이 추가되지 않는다.
- 날짜 기준은 Asia/Seoul이다. 이전 날짜 기록은 복습만 가능하다.
- 보이는 탭에서 실제 재생한 시간 30분마다 10P, 하루 최대 60P. 탐색·배속으로 시청 시간을 부풀리지 않는다.
- 구매는 포인트 부족·중복 구매를 차단한다. 구매 즉시 해당 종류 아이템이 착용된다.
- 현재 포인트·구매·퀴즈·이어보기는 서버 영속화가 아니다.
- 마이페이지의 시연 초기화로 프로필·학습·구매 기록을 처음부터 확인할 수 있다.

## 실제 연결 경로
### Spring Boot
`POST /api/auth/signup`, `POST /api/auth/login`, 온보딩 API, 내 정보 및 설정 API를 구현했다.
브라우저의 /api/* 요청은 개발 프록시를 통해 localhost:8080으로 전달된다.
로그인 토큰만 sessionStorage에 저장하며 비밀번호는 저장하지 않는다.
401 또는 JWT exp 만료 시 로그인으로 돌아간다. 상태 조회 오류 시 토큰을 유지하고 재시도한다.

서버 주소를 바꾸려면 Git에서 제외되는 `.env.development.local`:
```dotenv
VITE_API_BASE_URL=
DEV_API_PROXY_TARGET=https://api.injecapstone.com
DEV_AI_PROXY_TARGET=http://localhost:8000
```
이 운영 주소의 가동 여부는 이번 작업에서 검증하지 않았다. 설정 변경 후 Vite 재시작이 필요하다.

### AI
실제 모드에서는 AI의 기존 /api/games, state, cards, simplify, moment, matchup, chat, glossary, quiz를 호출한다.
개발 환경의 /ai-api/*는 localhost:8000으로 프록시하고 /ai-api 접두사만 제거한다.
Spring에 AI 중계 API가 이미 있다는 가정은 하지 않았다.
운영 AI 주소는 `VITE_AI_BASE_URL`로 별도 설정한다. 인증 없는 AI를 공개 서비스로 직접 노출하는 배포는 현재 구성 범위에 포함되지 않는다.

### 녹화 영상
실제 영상은 저장소에 없다. 가상 경기 데이터를 실제 분석 결과로 표현하지 않는다.
시연 플레이어에서 로컬 영상을 선택할 수 있지만 준비된 장면과 자동 정합하지 않는다.
실제 모드에서 재생하려면 동일 영상 기준의 AI 경기 데이터와 아래 설정이 필요하다.
```dotenv
VITE_REPLAY_GAME_ID=실제_AI_경기_ID
VITE_REPLAY_VIDEO_URL=/videos/확보한-경기.mp4
```
게임 목록의 has_video와 재생 주소가 모두 준비된 경기만 실제 모드에서 선택할 수 있다.
카드 API의 t는 영상 초이므로 프론트에서 오프셋을 다시 더하지 않는다.

## 화면 범위와 미연결 기능
구현 경로: /login, /signup, /password-reset, /onboarding, /, /watch/:gameId,
/dictionary?term=, /quiz, /shop, /mypage, 기존 /api-test.
비밀번호 재설정·변경과 실제 회원 탈퇴는 서버 API가 없어 화면만 제공하고 실제 완료를 표시하지 않는다.
소셜 로그인은 현재 Figma 로그인 화면에 없고 이번 화면 구현에 포함하지 않았다.
라이브 경기·북마크·'내가 배운 룰'은 구현 대상에서 제외했다.
사전·퀴즈에만 캐릭터 보상 띠를 표시한다.
정적 달력 스크린샷 대신 동작하는 날짜 입력을 사용하며 Figma 달력 아이콘은 로컬 자산을 사용한다.

## 소스 구성
- src/auth: 실제 로그인 세션 및 명시적 시연 진입
- src/api: Spring 요청 및 AI 전용 클라이언트
- src/services/gameService.ts: 실제 AI와 시연 데이터 선택 경계
- src/demo: 시연 계정·경기·진단·퀴즈 데이터
- src/state: 계정별 기기 내 학습·포인트·구매 기록
- src/pages: 화면과 사용자 동작
- src/components: 공통 메뉴·모달·오류·오프라인 안내·캐릭터
- src/data/glossarySeed.ts: AI 저장소 main 749bc2f의 용어 시드 109개 재사용
- src/assets/fonts: Figma의 42dot Sans와 OFL 라이선스
- src/assets/figma/calendar.png: Figma 제공 아이콘

실제 API가 준비되면 화면을 다시 만들지 않고 서비스 경계를 변경할 수 있다.
시연 데이터로 조용히 대체하는 오류 폴백은 사용하지 않는다.

## 검증
`npm run build`, `npm run lint`.
브라우저 자동 검사는 외부 서버 없이 수행하며 실제 서버 연동 성공을 의미하지 않는다.
배포 시 Vite 프록시는 동작하지 않는다. 실제 API/CORS 또는 동일 Origin reverse proxy,
SPA 경로의 index.html fallback을 배포 환경에서 별도로 맞춰야 한다.

