# 프론트엔드 코드 찾기

## 먼저 수정할 곳

- 화면 비율, 바깥 여백, 영상 비율, 스플래시 장식 위치: `src/styles/tokens.css`
- 화면 구조와 기능 연결: `src/pages/`
- 화면 안의 독립 UI: 각 화면 폴더의 컴포넌트 파일
- API 요청과 서버 응답 변환: `src/api/`, `src/services/`
- 공통 버튼·입력·색상: `src/styles/base.css`, `src/styles/tokens.css`
- 화면별 디자인: 이름에 맞는 `src/styles/*.css`
- 좁은 화면 대응: `src/styles/responsive.css`와 `src/styles/page-responsive.css`

## 화면별 구조

### 시청

- `src/pages/WatchPage.tsx`: 화면을 조립하고 재생·종료 동작을 연결합니다.
- `src/pages/watch/useWatchData.ts`: 경기, 설명 카드, 장면 분석 API 데이터를 불러옵니다.
- `src/pages/watch/WatchPlayer.tsx`: 영상과 재생 위치 UI입니다.
- `src/pages/watch/WatchChat.tsx`: 챗봇 대화 UI입니다.
- `src/pages/watch/WatchCardsPanel.tsx`: 감지 키워드와 설명 카드 UI입니다.
- `src/pages/watch/WatchAnalysisPanel.tsx`: 매치업·장면 분석 UI입니다.

### 퀴즈

- `src/pages/QuizPage.tsx`: 문제 풀이와 기록 패널을 연결합니다.
- `src/pages/quiz/useQuizSession.ts`: 문제 조회, 답안 제출, 현재 풀이 상태를 관리합니다.
- `src/pages/quiz/QuizQuestionPanel.tsx`: 문제 풀이 UI입니다.
- `src/pages/quiz/QuizHistoryPanel.tsx`: 풀이 기록과 통계 UI입니다.
- `src/services/quizService.ts`: 퀴즈 API 요청과 응답 검증입니다.

## 스타일 파일

`src/index.css`가 스타일 파일들을 용도별로 불러옵니다. 컴포넌트 코드를 바꾸기 전에 해당 화면 CSS부터 확인하고, 공통 스타일은 `base.css`, 화면 치수는 `tokens.css`, 반응형 동작은 반응형 CSS에서 조정합니다.

## 정리 원칙

- 페이지는 API 형식 변환, 화면 조립, 세부 UI를 한 파일에 몰아넣지 않습니다.
- 서버 통신과 DTO 변환은 서비스 경계에 둡니다.
- 여러 화면에서 쓰는 상태는 `src/state/`, 반복 조회 로직은 `src/hooks/`에 둡니다.
- UI 조정값은 우선 CSS 변수로 둡니다. API 주소, 영상 주소, 경기 ID처럼 환경마다 다른 값은 코드에 넣지 않고 환경 설정이나 서비스 경계에서 관리합니다.
