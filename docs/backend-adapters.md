# 서버 연동 경계와 이번 화면 수정

2026-10-27 기준. 이 문서의 QuizRepository, DailyQuiz, QuizReceipt 등은 **프론트 화면 모델**이며 확정된 서버 REST 명세가 아닙니다. 임의의 URL이나 DTO를 실제 API처럼 추가하지 않았습니다.

## 퀴즈

- 화면: `src/pages/QuizPage.tsx`. 문제 ID, 보기 ID, 문항 수, 제출 가능 여부, 해설, 정답, 보상은 repository 응답으로 렌더링합니다.
- 서비스: `src/services/quizService.ts`. 시연 세션이면 demo repository, 실제 로그인 세션이면 등록된 backend port만 사용합니다. 실제 모드에서 fixture로 자동 대체하지 않습니다.
- 연결 위치: `src/integrations/backendPorts.ts`의 `configureBackendPorts({quiz: adapter})`. 확정된 REST 명세를 받은 후 별도의 API 어댑터를 작성하고 앱 초기화 시 등록합니다.
- 계약: `src/types/quiz.ts`. `history({start,end},signal)`, `load(date,signal)`, `submit({quizId,questionId,choiceId,submissionId})`.
- API 어댑터는 실제 DTO를 화면 모델로 변환하고 인증·취소·오류 처리를 담당합니다. Spring 요청에는 기존 `apiClient`를 재사용할 수 있습니다.
- 답안 재시도 시 같은 submissionId를 재사용합니다. 서버는 중복 제출 방지와 채점·보상·기록 저장을 원자적으로 처리해야 합니다. 화면에서 정답을 비교하거나 +20P를 실제 계정에 임의 지급하지 않습니다.
- pointsBalance는 서버가 확인한 잔액일 때만 전달합니다. 없으면 실제 모드의 잔액은 화면이 추정하지 않습니다.
- 별도 시연 전용 파일: `src/demo/quizFixture.ts`, `src/demo/quizRepository.ts`. 기존 샘플 문항을 이곳으로 격리했습니다. 브라우저 저장소 `lookie.demo.quizzes.v2`는 실제 사용자 기록이 아닙니다. 백엔드 소유의 문제/풀이 기록은 실제 adapter로 조회합니다.
- AI의 문제 생성 API를 일일 퀴즈 저장·채점 API로 간주하지 않습니다. 기존 QuizPage의 AI 직접 생성 호출과 ProgressProvider의 자체 채점 경로를 제거했습니다.
- 기존 `Progress.quizzes` 필드는 이전 로컬 데이터 호환용이며 새 화면에서 사용하지 않습니다. 이전 기록을 임의 삭제하거나 서버 기록으로 업로드하지 않습니다.

예시 연결 형태(확정 DTO 변환 구현이 필요하며 예시 자체는 API가 아닙니다):

```ts
configureBackendPorts({
  quiz: confirmedQuizAdapter,
  deleteCurrentAccount: confirmedAccountAdapter.deleteCurrentAccount,
})
```

## 회원 탈퇴

- `src/services/accountService.ts` → 등록된 `deleteCurrentAccount` adapter.
- adapter는 확정된 탈퇴 요청이 성공한 뒤에만 `{deleted:true}`로 정규화합니다. 예를 들어 확정 명세가 204 성공이면 해당 응답을 확인한 후 변환합니다. 현재는 URL/메서드를 가정하지 않습니다.
- 미연결·오류·성공 미확인 시 S7a에 오류를 보여주고 로그인/로컬 기록을 유지합니다. 대기 중 중복 클릭과 닫기를 막습니다.
- 성공 후에만 현재 계정 로컬 기록과 토큰을 정리하고 `/splash`로 이동해 기다리며, 사용자가 로그인 버튼을 누르면 `/login`으로 이동합니다. 시연 계정은 브라우저의 시연 데이터만 삭제합니다.
- 인증 가드가 탈퇴 전환 목적지 `/splash`를 함께 받아 로그인 화면으로 건너뛰는 경합을 방지합니다.

## 세션과 소셜 로그인

- 처음 진입 시 로그인 버튼이 있는 시작 스플래시를 표시하며 저장된 세션을 백그라운드에서 확인합니다. 확인이 끝나도 자동 이동하지 않습니다. 로그인 버튼을 누른 뒤 세션 결과에 따라 이동하며, 아직 확인 중이면 로딩 화면, 실패하면 재시도 화면을 표시합니다. OAuth callback은 일회용 코드 교환을 위해 시작 버튼 대기를 생략합니다.
- 유효한 완료 계정 → 홈, 유효한 미완료 계정 → 온보딩 재개, 만료/신규 → 로그인입니다.
- Google/Kakao는 실제 Spring의 `/oauth2/authorization/{provider}`로 이동합니다. 실제 공급자 로그인 테스트는 아직 하지 않았습니다.
- `/oauth/callback?code=...`에서 확인된 `/api/auth/oauth/exchange` 계약을 사용하고, 주소창에서 일회용 코드를 제거합니다. React StrictMode의 중복 마운트는 한 번의 교환 요청을 공유합니다.
- 기본 API 주소와 OAuth origin을 분리해야 하면 `VITE_OAUTH_BASE_URL`을 설정합니다. 개발 프록시는 OAuth 시작/공급자 callback 경로만 Spring으로 전달합니다. Spring의 FRONTEND_URL은 프론트 origin과 맞춰야 합니다.

## 화면 동작 설정

- `VITE_TEAM_QUESTION_POLICY=all`이 기본값입니다. `introductory-only`로 바꾸면 입문자에게만 응원팀을 질문합니다. 다른 수준의 질문 생략 시 Spring의 필수 단계와 호환되도록 NONE을 명시적으로 저장한 뒤 완료 요청을 합니다. 결과 화면에서 재진단할 수 있습니다.
- 달력 기본 범위는 서울 시간 오늘~6일 전, 양 끝 포함 7일입니다. 최대 7일의 임의 과거 범위를 선택할 수 있고 미래 날짜는 비활성화됩니다. 달력은 검색창 오른쪽 아래에 정렬됩니다.
- AI 설명은 term_id에 대응하는 용어 이름을 키워드로 먼저 표시하고 CTA 뒤에 본문을 엽니다. 선수 매치업/현재 장면 분석은 독립적으로 접고 펼칩니다. 라이브 연동을 추가하지 않았습니다.
- 연결 단절 시 안내 대화상자를 표시합니다. 시연 모드는 사용자가 명시적으로 계속하기를 선택할 수 있습니다. 실제 통신 오류도 각 resource의 재시도 처리로 유지합니다.
- 기존 상점의 실제 구매 차단을 유지했고, 실모드 시청 시간에 대한 프론트 임의 포인트 지급을 중단했습니다.

## 디자인과 자산 출처

기존 Figma User Flow v3의 스플래시/S7a/설정/퀴즈 레이아웃을 재사용하고 이번 요청의 추가 버튼과 상태를 반영했습니다.
Google 원형 버튼: https://developers.google.com/identity/branding-guidelines
Kakao 원본 로그인 리소스: https://developers.kakao.com/tool/resource/login
원본 SVG는 `src/assets/brands`에 저장했습니다. Kakao 원본은 CSS viewport로 심벌 위치만 표시하며 파일 자체는 변경하지 않았습니다.

## 검증 범위

실제 서버/공급자 연결은 제외했습니다. 타입 검사와 빌드, ESLint, 브라우저 시연 흐름, 인터셉트한 인증 응답 및 주입한 어댑터의 지연·오류·성공 응답으로 검증합니다. 실제 Spring/AI 배포 환경, CORS, OAuth 등록 설정, 확정될 퀴즈/탈퇴 API는 통합 시 별도 검증해야 합니다.

스플래시 실밥은 좌우 `) (` 곡선 위를 따라 아래로 이동합니다. 동작 줄이기 설정에서는 기본 정지하며, 화면 하단의 재생 버튼으로 해당 장식만 명시적으로 재생/정지할 수 있습니다. 운영체제 설정은 변경하지 않습니다.

## 컴퓨터·태블릿 반응형 화면

- `src/styles/responsive.css`를 마지막에 적용합니다. 최상위 1200px 고정 폭을 제거하고 브라우저 콘텐츠 영역 전체를 사용합니다.
- 기존 UI 치수를 rem 기준으로 통일하고, 기준 글자 크기는 화면 너비에 따라 16~24px 범위로 조절합니다. 큰 모니터에서 글자·버튼·간격이 함께 커지며, 단순 화면 확대(transform/zoom)는 사용하지 않습니다.
- 비율 기반 Grid/Flex를 사용합니다. 900px 이하 태블릿에서는 시청 화면을 영상 위/분석 아래로 배치하고, 상품·경기 목록 열 수도 가용 폭에 맞춥니다. 영상 자체는 16:9를 유지합니다.
- 24/27/32인치라는 물리 크기 대신 실제 CSS 뷰포트와 브라우저 배율이 기준입니다. 세로 공간이 부족하면 정상적인 세로 스크롤을 허용하고, 글자를 지나치게 줄이거나 콘텐츠를 잘라내지 않습니다.
- 모바일의 기존 최소 대응은 유지하며 이번 검증 대상은 컴퓨터·태블릿입니다.
- 오프라인 안내 중앙의 야구공은 `BaseballSpinner`의 SVG로 그립니다. 시계 방향의 제자리 회전이며 독립적인 정지/재생 버튼을 제공합니다. 동작 줄이기에서는 8초 주기로 천천히 회전합니다. 네트워크/인증/퀴즈 어댑터 계약은 변경하지 않습니다.
- Edge headless 뷰포트: 768x1024, 820x1180, 1024x768, 1280x800, 1366x768, 1920x1080, 2560x1440, 3440x1440, 3840x2160. 홈/시청/사전/퀴즈/상점/마이페이지의 전체 폭, 가로 잘림, 영상 비율을 검증합니다. 온보딩/달력/설정, 오프라인 회전 방향과 중심 고정/재생정지/복구도 별도로 확인합니다.
