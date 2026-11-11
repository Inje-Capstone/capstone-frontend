# 서버 연동 경계 — 2026-11-12

프론트 PR #9~#16이 포함된 develop `965e31f7225ebb64b1077164bf923ff12d161922`의 인증·퀴즈 동작과 최신 UI 수정을 결합했습니다.

## 인증·온보딩·사용자 정보

- 가짜 로그인 세션, 시연 회원가입, 로컬 프로필/온보딩 대체 분기를 제거했습니다. JWT와 서버 응답으로만 인증·온보딩 상태를 결정합니다.
- 기존 로그인·회원가입·OAuth·온보딩·내 정보 API URL, HTTP 메서드와 요청 데이터는 유지합니다.
- 공급자 로그인은 Spring `/oauth2/authorization/{provider}`, 일회용 코드 교환은 `/api/auth/oauth/exchange`를 사용합니다. 최근 OAuth 오류 안내와 중복 교환 방지 코드를 유지합니다.
- `VITE_TEAM_QUESTION_POLICY=all`이 기본값이고, `introductory-only`는 팀 선택 생략 수준에 NONE을 명시적으로 저장한 뒤 완료합니다.

## 퀴즈와 탈퇴

- `QuizRepository`, `DailyQuiz`, `QuizReceipt`는 `src/types/quiz.ts`의 프론트 화면 모델이며 확정 REST 명세가 아닙니다.
- 퀴즈 화면은 PR #10의 `quizService.load()`/`submit(questionId, choiceId)`를 사용합니다. GET `/api/quizzes/questions`와 POST `/api/quizzes/questions/{questionId}/answers`를 JWT로 호출하고 서버의 `correct`만으로 정답·오답을 표시합니다. 오래된 QuizRepository 포트는 현재 화면의 호출 경로가 아닙니다.
- 풀이 기록 GET `/api/quizzes/attempts`와 전체 통계 GET `/api/quizzes/attempts/summary`를 연결했습니다. 정답/오답 필터와 최근 5/10/20개 조회, 수동 새로고침, 제출 성공 후 갱신을 제공합니다. 기록 조회 오류는 문제 풀이와 별도로 표시·재시도합니다.
- 해설·포인트·날짜별 퀴즈는 현재 화면에서 미연결입니다. 미제공 정답이나 보상을 만들지 않습니다. submissionId는 현재 제출 DTO에 없으며 화면의 중복 클릭 방지는 서버의 중복 저장 방지를 보장하지 않습니다. attemptId는 미병합 PR #37의 필드이므로 사용하지 않습니다. 기록 시각은 서버 문자열 기준으로 표시하며 LocalDateTime의 시간대를 추측해 변환하지 않습니다.
- 탈퇴는 `backendPort('deleteCurrentAccount')`만 사용합니다. 성공 확인 후 정규화된 `{deleted:true}`를 반환하고, 프론트는 그 후에만 세션/현재 계정 로컬 기록을 정리합니다. 성공 미확인/오류/미등록 시 계정 삭제로 표시하지 않습니다.
- 탈퇴 연결 위치는 `configureBackendPorts(...)`이며, 현재 등록 구현은 없습니다. 실제 API가 준비되면 어댑터를 작성·등록해야 합니다.

## 경기·AI

- 화면은 공통 `gameService`를 사용하고 실제 호출은 `aiGameService`, 시연 구현과 모든 경기/용어 시드는 `src/demo`에 분리했습니다. 실제 모드 빌드에 시연 모듈이 포함되지 않는 것을 확인했습니다. [전환 및 제거 절차](ai-data-transition.md)를 참고하세요.

- `VITE_AI_DEMO_MODE=true`인 배포는 기존 경기·용어·카드·분석·채팅 대체 데이터를 계속 사용합니다. 이 플래그로 인증을 건너뛰지는 않습니다.
- 영상·AI 실제 경로와 타임코드가 확정되기 전에는 대체 데이터를 제거하거나 가상 데이터를 실제 경기로 표시하지 않습니다.
- 수동 로컬 영상 파일 선택, 플레이어 아래 장면 점프 버튼, 별도 재생·배속 UI는 제거했습니다. 실제 video 기본 controls·타임라인·카드 CTA는 유지합니다.

## 설정·상점·복구

- 관심 카테고리와 복습 설정·시청 위치는 현재 로컬 저장입니다. 계정 간 로컬 기록 키는 분리합니다.
- 상점 디자인 미리보기는 유지하고 가상 가격·로컬 구매·착용 변경·자체 포인트 지급은 제거했습니다. 실제 거래는 미연동 상태로 비활성화합니다.
- 모든 경로의 연결 감지는 AuthProvider 바깥 경계에서 처리합니다. /offline 전체 화면 → online 시 /splash → 세션 확인 후 기존 화면/영상 초로 복귀합니다. 유효 세션은 PR #9/#15의 스플래시 처리에 따라 자동 이동하고, 익명 상태는 시작 버튼을 제공합니다. 수동 로그아웃은 PR #16에 따라 /splash로 이동합니다.
- 곡선 실밥과 평면 야구공은 CSS 자동 반복 애니메이션이며 정지/재생 제어는 없습니다. 주기적 서버 polling이나 service worker는 추가하지 않았습니다.

백엔드에 전달할 세부 요청은 [연동 체크리스트](backend-integration-checklist.md)를 참고하세요. 과거 단계의 시연 계정/로컬 퀴즈 설명보다 이 문서와 현재 코드가 우선합니다.
